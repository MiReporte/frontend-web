"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { getReports } from "@/services/getReports";
import type { PaginatedResponse, ResponseReports } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";
import { reverseGeocode } from "@/utils/reverseGeocoding";
import { NewStateSelector } from "@/components/NewStateSelector";
import { UpdateSupervisorModal } from "@/components/Modals/UpdateSupervisorModal";
import { ReportModal } from "@/components/Modals/ReportModal";
import { ViewLocationReport } from "@/components/Modals/ViewLocationReport";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { getSupervisorReports } from "@/services/getSupervisorReports";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";

export default function ReportesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<
    (ResponseReports & { address?: string })[]
  >([]);
  const [showLocationReportModal, setShowLocationReportModal] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showUpdateSupervisorModal, setShowUpdateSupervisorModal] = useState<{
    reportId: number;
    supervisorId: number | null;
  } | null>(null);
  const [showReportModal, setShowReportModal] = useState<{
    reportId: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReportsCount, setTotalReportsCount] = useState<number>(0);
  const limit = 10;
  const addressCache = useRef(new Map<string, string>());
  const [currentStatus, setCurrentStatus] = useState("");

  // Filtros de búsqueda por ubicación y rango de fechas
  const [searchLocation, setSearchLocation] = useState("");
  const [appliedLocation, setAppliedLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const searchParams = useSearchParams();
  const { lastReportEvent } = useNotifications();
  const lastProcessedEventIdRef = useRef<string | null>(null);
  const openedParamReportIdRef = useRef<number | null>(null);
  const highlightedReportId = searchParams.get("report_id")
    ? Number(searchParams.get("report_id"))
    : null;

  const userIdParam = searchParams.get("user_id");
  const userNameParam = searchParams.get("user_name");
  const filteredUserId =
    userIdParam && !isNaN(Number(userIdParam)) ? Number(userIdParam) : null;

  const prevUserIdRef = useRef<number | null>(filteredUserId);
  useEffect(() => {
    if (prevUserIdRef.current !== filteredUserId) {
      prevUserIdRef.current = filteredUserId;
      setCurrentPage(1);
    }
  }, [filteredUserId]);

  // Debounce para búsqueda por ubicación
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchLocation.trim() !== appliedLocation) {
        setAppliedLocation(searchLocation.trim());
        setCurrentPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchLocation, appliedLocation]);

  useEffect(() => {
    const reportIdParam = searchParams.get("report_id");
    if (reportIdParam) {
      const parsedId = Number(reportIdParam);
      if (
        !isNaN(parsedId) &&
        parsedId > 0 &&
        openedParamReportIdRef.current !== parsedId
      ) {
        openedParamReportIdRef.current = parsedId;
        setShowReportModal({ reportId: parsedId });
      }
    }
  }, [searchParams]);

  const fetchReports = useCallback(
    async (
      page: number,
      status = "",
      userId: number | null = null,
      location = "",
      start = "",
      end = ""
    ) => {
      try {
        setLoading(true);
        setError(null);

        let paginatedData: PaginatedResponse;

        if (user?.role?.toLowerCase() === "supervisor tecnico") {
          if (!user?.token) throw new Error("Token no encontrado");

          const supervisorList = await getSupervisorReports(user.token);

          // Filtrar en cliente si el usuario es supervisor
          let filteredList = supervisorList;

          if (status) {
            filteredList = filteredList.filter(
              (r) => (r.status || "").toUpperCase() === status.toUpperCase()
            );
          }

          if (start) {
            filteredList = filteredList.filter((r) => {
              if (!r.date) return false;
              const rDate = r.date.split("T")[0];
              return rDate >= start;
            });
          }

          if (end) {
            filteredList = filteredList.filter((r) => {
              if (!r.date) return false;
              const rDate = r.date.split("T")[0];
              return rDate <= end;
            });
          }

          if (location) {
            const locLower = location.toLowerCase();
            filteredList = filteredList.filter(
              (r) =>
                (r.description || "").toLowerCase().includes(locLower) ||
                (r.neighborhood || "").toLowerCase().includes(locLower)
            );
          }

          const total = filteredList.length;
          const totalPagesCount = Math.max(1, Math.ceil(total / limit));
          const pagedItems = filteredList.slice(
            (page - 1) * limit,
            page * limit
          );

          paginatedData = {
            items: pagedItems,
            limit,
            page,
            totalItems: total,
            totalPages: totalPagesCount,
          };
        } else {
          paginatedData = await getReports(
            page,
            limit,
            status,
            userId,
            location,
            start,
            end
          );
        }

        const items = paginatedData.items ?? [];

        if (items.length === 0) {
          setReports([]);
          setTotalPages(1);
          setTotalReportsCount(0);
          return;
        }

        const concurrency = 2;
        const results: (ResponseReports & { address?: string })[] = [];

        for (let i = 0; i < items.length; i += concurrency) {
          const batch = items.slice(i, i + concurrency);
          const batchResults = await Promise.all(
            batch.map(async (report) => {
              const key = `${report.latitude},${report.longitude}`;

              if (addressCache.current.has(key)) {
                return { ...report, address: addressCache.current.get(key) };
              }

              try {
                const address = await reverseGeocode(
                  report.latitude,
                  report.longitude
                );
                addressCache.current.set(key, address);
                return { ...report, address };
              } catch {
                return { ...report, address: "Sin ubicación" };
              }
            })
          );
          results.push(...batchResults);
          await new Promise((r) => setTimeout(r, 60));
        }

        setReports(results);
        setTotalPages(paginatedData.totalPages);
        setTotalReportsCount(paginatedData.totalItems ?? results.length);
      } catch (err) {
        setError(getErrorMessage(err));
        setReports([]);
        setTotalReportsCount(0);
      } finally {
        setLoading(false);
      }
    },
    [limit, user]
  );

  useEffect(() => {
    fetchReports(
      currentPage,
      currentStatus,
      filteredUserId,
      appliedLocation,
      startDate,
      endDate
    );
  }, [
    currentPage,
    currentStatus,
    filteredUserId,
    appliedLocation,
    startDate,
    endDate,
    fetchReports,
  ]);

  // Actualizar tabla en tiempo real cuando llega un nuevo reporte vía Socket.IO
  useEffect(() => {
    if (!lastReportEvent?.report?.report_id) return;

    const eventKey = `${lastReportEvent.report.report_id}-${lastReportEvent.report.date}`;
    if (lastProcessedEventIdRef.current === eventKey) return;
    lastProcessedEventIdRef.current = eventKey;

    const userRole = user?.role?.toLowerCase();
    const isAllowed =
      userRole === "administrador" || userRole === "mesa de servicios";

    if (isAllowed && (currentStatus === "" || currentStatus === "REVISION")) {
      if (
        filteredUserId &&
        lastReportEvent.report.reporting_user !== filteredUserId
      ) {
        return;
      }
      fetchReports(
        currentPage,
        currentStatus,
        filteredUserId,
        appliedLocation,
        startDate,
        endDate
      );
    }
  }, [
    lastReportEvent,
    user?.role,
    currentStatus,
    currentPage,
    filteredUserId,
    appliedLocation,
    startDate,
    endDate,
    fetchReports,
  ]);

  useEffect(() => {
    if (highlightedReportId && reports.length > 0) {
      const row = document.getElementById(`report-row-${highlightedReportId}`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedReportId, reports]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  }, [currentPage, totalPages]);

  const handleSwitch = useCallback(
    (status: string) => () => {
      setCurrentStatus(status);
      setCurrentPage(1);
    },
    []
  );

  const handleClearUserFilter = useCallback(() => {
    router.push("/dashboard/reportes");
  }, [router]);

  const handleClearAllFilters = useCallback(() => {
    setSearchLocation("");
    setAppliedLocation("");
    setStartDate("");
    setEndDate("");
    setCurrentStatus("");
    setCurrentPage(1);
  }, []);

  const OpenModalSupervisor = useCallback(
    (reportId: number, supervisorId: number | null) => {
      setShowUpdateSupervisorModal({ reportId, supervisorId });
    },
    []
  );

  const OpenModalReport = useCallback((reportId: number) => {
    setShowReportModal({ reportId });
  }, []);

  const OpenModalLocationReport = useCallback(
    (latitude: number, longitude: number) => {
      setShowLocationReportModal({ latitude, longitude });
    },
    []
  );

  const refreshReports = useCallback(() => {
    fetchReports(
      currentPage,
      currentStatus,
      filteredUserId,
      appliedLocation,
      startDate,
      endDate
    );
  }, [
    fetchReports,
    currentPage,
    currentStatus,
    filteredUserId,
    appliedLocation,
    startDate,
    endDate,
  ]);

  const brandColor = "#611232";

  const getFilterStyle = (filterId: string) => {
    switch (filterId) {
      case "REVISION":
        return { bg: "#F59E0B", text: "#fff" };
      case "APROBADO":
        return { bg: "#16A34A", text: "#fff" };
      case "NO_APROBADO":
        return { bg: "#DC2626", text: "#fff" };
      case "PROCESO":
        return { bg: "#ff7800", text: "#fff" };
      case "COMPLETADO":
        return { bg: "#2563EB", text: "#fff" };
      case "CIERRE":
        return { bg: "#9333EA", text: "#fff" };
      default:
        return { bg: brandColor, text: "#fff" };
    }
  };

  const filters = [
    { id: "", label: "Todos los estados" },
    { id: "REVISION", label: "En revisión" },
    { id: "APROBADO", label: "Aprobado" },
    { id: "NO_APROBADO", label: "No aprobado" },
    { id: "PROCESO", label: "En proceso" },
    { id: "COMPLETADO", label: "Completado" },
    { id: "CIERRE", label: "Cierre técnico" },
  ];

  const hasActiveFilters = Boolean(
    appliedLocation || startDate || endDate || currentStatus
  );

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    return `${d}/${m}/${y}`;
  };

  return (
    <ProtectedPage permission="reportes">
      <div className="container-fluid py-4">
        <div className="bg-white rounded-4 shadow-sm p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-3 gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold m-0 text-dark">Listado de reportes</h4>
                {!loading && (
                  <span
                    className={`badge rounded-pill px-2.5 py-1.5 fw-medium ${
                      hasActiveFilters
                        ? "bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                        : "bg-light text-secondary border"
                    }`}
                    style={{ fontSize: "0.78rem" }}
                  >
                    {totalReportsCount} {totalReportsCount === 1 ? "reporte" : "reportes"}
                    {hasActiveFilters && " filtrados"}
                  </span>
                )}
              </div>
              <p className="text-muted small mb-0 mt-1">
                Consulta, busca y gestiona las incidencias registradas en la plataforma.
              </p>
            </div>
          </div>

          {filteredUserId && (
            <div className="alert alert-primary d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4 border-0 shadow-sm rounded-3 py-3 px-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                  style={{ width: "42px", height: "42px", backgroundColor: "#611232" }}
                >
                  <i className="bi bi-person-fill fs-5"></i>
                </div>
                <div>
                  <span
                    className="small text-secondary fw-semibold d-block text-uppercase"
                    style={{ letterSpacing: "0.5px" }}
                  >
                    Filtro activo por ciudadano
                  </span>
                  <span className="fw-bold text-dark fs-6">
                    {userNameParam
                      ? `${userNameParam} (ID: ${filteredUserId})`
                      : `Ciudadano ID: ${filteredUserId}`}
                  </span>
                </div>
              </div>
              <button
                onClick={handleClearUserFilter}
                className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-2 px-3 py-1 shadow-sm bg-white"
                title="Quitar filtro y ver todos los reportes"
              >
                <i className="bi bi-x-circle-fill"></i>
                <span>Ver todos los reportes</span>
              </button>
            </div>
          )}

          {/* Barra de Búsqueda y Rango de Fechas */}
          <div className="row g-2 mb-3 align-items-center">
            {/* Buscador por Ubicación */}
            <div className="col-12 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted rounded-start-pill ps-3">
                  <i className="bi bi-geo-alt-fill text-danger"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm border-start-0 border-end-0 bg-white"
                  placeholder="Buscar por calle, colonia o descripción..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{ outline: "none", boxShadow: "none" }}
                />
                {searchLocation ? (
                  <button
                    className="btn btn-outline-secondary border-start-0 bg-white text-muted rounded-end-pill pe-3"
                    type="button"
                    onClick={() => {
                      setSearchLocation("");
                      setAppliedLocation("");
                      setCurrentPage(1);
                    }}
                    title="Limpiar búsqueda"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                ) : (
                  <span className="input-group-text bg-white border-start-0 text-muted rounded-end-pill pe-3">
                    <i className="bi bi-search"></i>
                  </span>
                )}
              </div>
            </div>

            {/* Rango de Fechas: Desde y Hasta */}
            <div className="col-12 col-md-8 col-lg-5">
              <div className="d-flex align-items-center gap-2">
                {/* Fecha Desde */}
                <div className="input-group input-group-sm flex-fill">
                  <span
                    className="input-group-text bg-white border-end-0 text-muted rounded-start-pill ps-2 pe-1"
                    title="Fecha inicial"
                  >
                    <i className="bi bi-calendar-event text-primary me-1"></i>
                    <small className="text-secondary fw-semibold" style={{ fontSize: "0.72rem" }}>
                      Desde
                    </small>
                  </span>
                  <input
                    type="date"
                    className="form-control form-control-sm border-start-0 border-end-0 bg-white px-1"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ outline: "none", boxShadow: "none", fontSize: "0.8rem" }}
                  />
                  {startDate && (
                    <button
                      className="btn btn-outline-secondary border-start-0 bg-white text-muted rounded-end-pill pe-2"
                      type="button"
                      onClick={() => {
                        setStartDate("");
                        setCurrentPage(1);
                      }}
                      title="Quitar fecha inicial"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                  {!startDate && (
                    <span className="input-group-text bg-white border-start-0 text-muted rounded-end-pill pe-2"></span>
                  )}
                </div>

                {/* Fecha Hasta */}
                <div className="input-group input-group-sm flex-fill">
                  <span
                    className="input-group-text bg-white border-end-0 text-muted rounded-start-pill ps-2 pe-1"
                    title="Fecha final"
                  >
                    <i className="bi bi-calendar-check text-success me-1"></i>
                    <small className="text-secondary fw-semibold" style={{ fontSize: "0.72rem" }}>
                      Hasta
                    </small>
                  </span>
                  <input
                    type="date"
                    className="form-control form-control-sm border-start-0 border-end-0 bg-white px-1"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ outline: "none", boxShadow: "none", fontSize: "0.8rem" }}
                  />
                  {endDate && (
                    <button
                      className="btn btn-outline-secondary border-start-0 bg-white text-muted rounded-end-pill pe-2"
                      type="button"
                      onClick={() => {
                        setEndDate("");
                        setCurrentPage(1);
                      }}
                      title="Quitar fecha final"
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                  {!endDate && (
                    <span className="input-group-text bg-white border-start-0 text-muted rounded-end-pill pe-2"></span>
                  )}
                </div>
              </div>
            </div>

            {/* Botón para Limpiar Todos los Filtros */}
            <div className="col-12 col-md-4 col-lg-2 text-md-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1 shadow-sm bg-white w-100 justify-content-center w-md-auto"
                  style={{ fontSize: "0.8rem" }}
                  title="Restablecer todos los filtros"
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Filtros por Estado */}
          <div className="d-flex flex-wrap gap-2 mb-3 border-bottom pb-3">
            {filters.map((filter) => {
              const isActive = currentStatus === filter.id;
              const activeStyle = getFilterStyle(filter.id);
              return (
                <button
                  key={filter.id}
                  onClick={handleSwitch(filter.id)}
                  className="btn btn-sm rounded-pill fw-medium px-3 transition-all"
                  style={{
                    backgroundColor: isActive ? activeStyle.bg : "#fff",
                    color: isActive ? activeStyle.text : "#6B7280",
                    border: isActive
                      ? `1px solid ${activeStyle.bg}`
                      : "1px solid #E5E7EB",
                    boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Indicador de cantidad de reportes filtrados */}
          {!loading && (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 px-1">
              {hasActiveFilters ? (
                <div className="d-flex flex-wrap align-items-center gap-2 small">
                  <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                    <i className="bi bi-funnel-fill"></i>
                    <span>
                      Filtrando: <strong>{totalReportsCount}</strong> {totalReportsCount === 1 ? "reporte encontrado" : "reportes encontrados"}
                    </span>
                  </span>
                  <span className="text-muted" style={{ fontSize: "0.8rem" }}>
                    {appliedLocation && <span>&bull; Ubicación: &ldquo;{appliedLocation}&rdquo; </span>}
                    {(startDate || endDate) && (
                      <span>
                        &bull; Fecha: {startDate ? formatDisplayDate(startDate) : "Inicio"}{" "}
                        {startDate && endDate && startDate === endDate
                          ? ""
                          : `al ${endDate ? formatDisplayDate(endDate) : "Fin"}`}{" "}
                      </span>
                    )}
                    {currentStatus && (
                      <span>&bull; Estado: {filters.find((f) => f.id === currentStatus)?.label}</span>
                    )}
                  </span>
                </div>
              ) : (
                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Mostrando {reports.length > 0 ? (currentPage - 1) * limit + 1 : 0} -{" "}
                  {Math.min(currentPage * limit, totalReportsCount)} de{" "}
                  <strong>{totalReportsCount}</strong> reportes registrados
                </small>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="btn btn-sm btn-link text-decoration-none text-muted p-0 ms-auto"
                  style={{ fontSize: "0.8rem" }}
                  title="Restablecer todos los filtros"
                >
                  <i className="bi bi-x-circle me-1"></i>Limpiar filtros
                </button>
              )}
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead
                className="border-light sticky-top bg-white"
                style={{ zIndex: 1, top: 0 }}
              >
                <tr>
                  <th className="text-secondary fw-normal small ps-3 bg-white">
                    ID
                  </th>
                  <th className="text-secondary fw-normal small bg-white">
                    Tipo
                  </th>
                  <th
                    className="text-secondary fw-normal small bg-white"
                    style={{ minWidth: "150px" }}
                  >
                    Ubicación
                  </th>
                  <th className="text-secondary fw-normal small bg-white" style={{ minWidth: "130px" }}>
                    Fecha
                  </th>
                  <th className="text-secondary fw-normal small bg-white">
                    Estado
                  </th>
                  <th className="text-secondary fw-normal small pe-4 bg-white">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <LoadingImage />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-danger">
                      {error}
                    </td>
                  </tr>
                ) : reports.length > 0 ? (
                  reports.map((report) => (
                    <tr
                      key={report.report_id}
                      id={`report-row-${report.report_id}`}
                      className={
                        highlightedReportId === report.report_id
                          ? "table-warning border-start border-4 border-warning shadow-sm"
                          : ""
                      }
                    >
                      <td className="ps-3 fw-medium text-dark">
                        {report.report_id}
                      </td>
                      <td className="text-dark">
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {report.typereport}
                        </span>
                      </td>
                      <td
                        className="text-secondary small text-truncate"
                        style={{ maxWidth: "260px" }}
                        title={report.address || "Sin ubicación"}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <i className="bi bi-geo-alt-fill text-danger flex-shrink-0" style={{ fontSize: "0.85rem" }}></i>
                          <span className="text-truncate">
                            {report.address || "Cargando..."}
                          </span>
                        </div>
                      </td>
                      <td className="text-dark small">
                        {report.date ? (
                          <div>
                            <div>
                              {new Date(report.date).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                              {new Date(report.date).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </small>
                          </div>
                        ) : (
                          <span className="text-muted">Sin fecha</span>
                        )}
                      </td>
                      <td>
                        <NewStateSelector
                          reportId={report.report_id}
                          currentStatus={report.status}
                        />
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-flex justify-content-start align-items-center gap-2">
                          <button
                            onClick={() => OpenModalReport(report.report_id)}
                            className="btn btn-sm action-btnz d-flex align-items-center"
                            title="Ver reporte"
                          >
                            <i className="bi bi-eye-fill fs-6"></i>
                          </button>
                          <button
                            onClick={() =>
                              OpenModalLocationReport(
                                report.latitude,
                                report.longitude
                              )
                            }
                            className="btn btn-sm action-btnz d-flex align-items-center"
                            title="Ver ubicación"
                          >
                            <i className="bi bi-geo-alt-fill fs-6"></i>
                          </button>
                          <button
                            onClick={() =>
                              OpenModalSupervisor(
                                report.report_id,
                                report.assigned_supervisor
                              )
                            }
                            className="btn btn-sm action-btnz d-flex align-items-center"
                            title="Ver supervisor"
                          >
                            <i className="bi bi-file-person-fill fs-6"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center justify-content-center py-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mb-3 bg-light text-muted"
                          style={{ width: "54px", height: "54px" }}
                        >
                          <i className="bi bi-calendar-x fs-3 text-secondary"></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">
                          No se encontraron reportes
                        </h6>
                        <p className="text-muted small mb-3" style={{ maxWidth: "460px" }}>
                          {startDate && endDate
                            ? startDate === endDate
                              ? `No hay incidencias registradas el ${formatDisplayDate(startDate)}${appliedLocation ? ` en "${appliedLocation}"` : ""}.`
                              : `No hay incidencias registradas en el rango del ${formatDisplayDate(startDate)} al ${formatDisplayDate(endDate)}${appliedLocation ? ` en "${appliedLocation}"` : ""}.`
                            : startDate
                            ? `No hay incidencias registradas a partir del ${formatDisplayDate(startDate)}${appliedLocation ? ` en "${appliedLocation}"` : ""}.`
                            : endDate
                            ? `No hay incidencias registradas hasta el ${formatDisplayDate(endDate)}${appliedLocation ? ` en "${appliedLocation}"` : ""}.`
                            : appliedLocation
                            ? `No hay incidencias registradas que coincidan con la ubicación "${appliedLocation}".`
                            : currentStatus
                            ? "No hay incidencias registradas para el estado seleccionado."
                            : filteredUserId
                            ? `No hay reportes registrados para ${userNameParam || `el ciudadano #${filteredUserId}`}.`
                            : "No hay reportes disponibles."}
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleClearAllFilters}
                            className="btn btn-sm btn-outline-secondary rounded-pill px-3 shadow-sm bg-white"
                          >
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Restablecer filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && reports.length > 0 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="btn btn-light rounded-pill px-3 text-secondary btn-sm border"
              >
                Anterior
              </button>
              <div className="d-flex gap-1 align-items-center">
                <span
                  className="d-flex justify-content-center align-items-center rounded-circle text-white small"
                  style={{
                    width: "28px",
                    height: "28px",
                    backgroundColor: brandColor,
                  }}
                >
                  {currentPage}
                </span>
                <span className="text-muted small mx-1">de {totalPages}</span>
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="btn btn-light rounded-pill px-3 text-secondary btn-sm border"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {showUpdateSupervisorModal && (
          <UpdateSupervisorModal
            reportId={showUpdateSupervisorModal.reportId}
            supervisorId={showUpdateSupervisorModal.supervisorId}
            onClose={() => setShowUpdateSupervisorModal(null)}
            onUpdated={refreshReports}
          />
        )}
        {showReportModal && (
          <ReportModal
            reportId={showReportModal.reportId}
            onClose={() => setShowReportModal(null)}
          />
        )}
        {showLocationReportModal && (
          <ViewLocationReport
            latitude={showLocationReportModal.latitude}
            longitude={showLocationReportModal.longitude}
            onClose={() => setShowLocationReportModal(null)}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
