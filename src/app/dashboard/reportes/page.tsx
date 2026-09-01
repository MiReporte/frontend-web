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
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { getSupervisorReports } from "@/services/getSupervisorReports";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";

export default function ReportesPage() {
  const { user } = useAuth();
  const router = useRouter();
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
  const limit = 10;
  const addressCache = useRef(new Map<string, string>());
  const [currentStatus, setCurrentStatus] = useState("");

  const searchParams = useSearchParams();
  const { lastReportEvent } = useNotifications();
  const lastProcessedEventIdRef = useRef<string | null>(null);
  const highlightedReportId = searchParams.get("report_id")
    ? Number(searchParams.get("report_id"))
    : null;

  const fetchReports = useCallback(
    async (page: number, status = "") => {
      try {
        setLoading(true);
        setError(null);

        let paginatedData: PaginatedResponse;

        if (user?.role?.toLowerCase() === "supervisor tecnico") {
          if (!user?.token) throw new Error("Token no encontrado");

          const supervisorList = await getSupervisorReports(user.token);

          paginatedData = {
            items: supervisorList,
            limit: supervisorList.length,
            page: 1,
            totalItems: supervisorList.length,
            totalPages: 1,
          };
        } else {
          paginatedData = await getReports(page, limit, status);
        }

        const items = paginatedData.items ?? [];

        if (items.length === 0) {
          setReports([]);
          setTotalPages(1);
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
          await new Promise((r) => setTimeout(r, 80));
        }

        setReports(results);
        setTotalPages(paginatedData.totalPages);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [limit, user]
  );

  useEffect(() => {
    fetchReports(currentPage, currentStatus);
  }, [currentPage, currentStatus, fetchReports]);

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
      fetchReports(currentPage, currentStatus);
    }
  }, [lastReportEvent, user?.role, currentStatus, currentPage, fetchReports]);

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
    fetchReports(currentPage, currentStatus);
  }, [fetchReports, currentPage, currentStatus]);

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

  return (
    <ProtectedPage permission="reportes">
      <div className="container-fluid py-4">
        <div className="bg-white rounded-4 shadow-sm p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
            <h4 className="fw-bold m-0 text-dark">Listado de reportes</h4>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
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
                    style={{ minWidth: "120px" }}
                  >
                    Ubicación
                  </th>
                  <th className="text-secondary fw-normal small bg-white">
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
                        className={
                          highlightedReportId === report.report_id
                            ? "table-warning border-start border-4 border-warning shadow-sm"
                            : ""
                        }
                      >
                        <td className="ps-3 fw-medium text-dark">
                          {report.report_id}
                        </td>
                        <td className="text-dark">{report.typereport}</td>
                        <td
                          className="text-secondary small text-truncate"
                          style={{ maxWidth: "250px" }}
                        >
                          {report.address || "Cargando..."}
                        </td>
                        <td className="text-dark small">{report.date}</td>
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
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No hay reportes disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && (
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
