"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import ProtectedPage from "@/components/ProtectedPage";
import { getReportsStatistics } from "@/services/getReportsStatistics";
import { getReportsCountByNeighborhood } from "@/services/getReportsCountByNeighborhood";
import { getReportsCountByDay } from "@/services/getReportsCountByDay";
import { getReportsMapPoints } from "@/services/getReportsMapPoints";
import {
  ReportStatistics,
  NeighborhoodReportCount,
  TimeRangeFilter,
  TimeRangeFilterState,
  ReportCountByDay,
  ReportMapPoint,
} from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

const ReportsMap = dynamic(() => import("@/components/ReportsMap"), {
  ssr: false,
  loading: () => (
    <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-light">
      <div className="spinner-border text-primary mx-auto mb-2" role="status" />
      <p className="text-muted m-0">Cargando mapa en tiempo real...</p>
    </div>
  ),
});

type ReportType = "BACHE" | "ALUM";
type ReportTypeFilter = ReportType | null;

const TIME_RANGE_MAP: { label: string; value: TimeRangeFilter | null }[] = [
  { label: "Hoy", value: "hoy" },
  { label: "Última semana", value: "ultima_semana" },
  { label: "Último mes", value: "ultimo_mes" },
  { label: "Últimos 6 meses", value: "ultimos_seis_meses" },
  { label: "Último año", value: "ultimo_anio" },
  { label: "Todo el tiempo", value: "todo_el_tiempo" },
];

const PieChart = ({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) => {
  const size = 220;
  const radius = 35;
  const strokeWidth = 30;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded"
        style={{ width: size, height: size, aspectRatio: 1 }}>
        <p className="m-0 text-muted" style={{ fontSize: "0.9rem" }}>
          Sin Datos
        </p>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percent = item.value / total;
          if (percent <= 0) return null;

          const cumulativePercent = data
            .slice(0, index)
            .reduce((sum, d) => sum + d.value / total, 0);
          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = `${cumulativePercent * circumference}`;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={-strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{
                transition: "stroke-dashoffset 0.5s ease-out",
                strokeLinecap: "butt",
              }}
            />
          );
        })}
        <circle cx="50" cy="50" r={20} fill="#fff" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#343a40">
          {total}
        </text>
        <text x="50" y="65" textAnchor="middle" fontSize="6" fill="#6c757d">
          Reportes
        </text>
      </svg>
    </div>
  );
};

interface BarChartData {
  day: string;
  count: number;
}

const BarChart = ({ data }: { data: BarChartData[] }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 0);
  const height = 150;
  const width = 350;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 20;

  if (maxCount === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded"
        style={{ height: height, width: "100%" }}>
        <p className="m-0 text-muted" style={{ fontSize: "0.9rem" }}>
          Sin Datos Semanales
        </p>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center" style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: "visible", maxHeight: "200px", width: "100%" }}>
        <line
          x1={paddingLeft}
          y1={height - paddingBottom}
          x2={width - paddingRight}
          y2={height - paddingBottom}
          stroke="#ccc"
          strokeWidth="1"
        />

        {data.map((item, index) => {
          const barWidth = (width - paddingLeft - paddingRight) / data.length;
          const x = paddingLeft + index * barWidth;
          const barHeight =
            item.count > 0
              ? (item.count / maxCount) * (height - paddingTop - paddingBottom)
              : 0;
          const y = height - paddingBottom - barHeight;
          const color = "#4F46E5";

          return (
            <g key={index}>
              <rect
                x={x + barWidth * 0.15}
                y={y}
                width={barWidth * 0.7}
                height={barHeight}
                fill={color}
                rx="2"
                style={{ transition: "height 0.5s ease-out" }}
              />

              <text
                x={x + barWidth / 2}
                y={height - paddingBottom / 2 + 5}
                textAnchor="middle"
                fontSize="8"
                fill="#6c757d">
                {item.day.slice(0, 3)}
              </text>

              {item.count > 0 && barHeight > 10 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#343a40">
                  {item.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const SAMPLE_STATS: ReportStatistics = {
  total_reports: 8,
  by_type: { BACHE: 5, ALUM: 3 },
  by_status: {
    REVISION: 4,
    PROCESO: 2,
    APROBADO: 1,
    COMPLETADO: 1,
    CIERRE: 0,
    "NO APROBADO": 0,
  },
};

export default function ResumenPage() {
  const { user } = useAuth();
  const { lastReportEvent } = useNotifications();
  const [stats, setStats] = useState<ReportStatistics | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodReportCount[]>(
    []
  );
  const [reportsByDay, setReportsByDay] = useState<ReportCountByDay | null>(
    null
  );
  const [mapPoints, setMapPoints] = useState<ReportMapPoint[]>([]);
  const [newReportPing, setNewReportPing] = useState<ReportMapPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportTypeFilter, setReportTypeFilter] =
    useState<ReportTypeFilter>(null);

  const [timeRangeFilter, setTimeRangeFilter] =
    useState<TimeRangeFilterState>("todo_el_tiempo");

  const STATUS_COLORS: { [key: string]: string } = {
    REVISION: "#F59E0B",
    APROBADO: "#16A34A",
    CIERRE: "#9333EA",
    COMPLETADO: "#2563EB",
    NO_APROBADO: "#DC2626",
    PROCESO: "#ff7800",
  };

  async function loadData(
    typeFilter: ReportTypeFilter,
    timeFilter: TimeRangeFilterState
  ) {
    setLoading(true);
    setError(null);

    if (!user || !user.token) {
      console.error("Authentication Error: Token not found.");
      setError("Error de autenticación. Por favor, vuelve a iniciar sesión.");
      setLoading(false);
      return;
    }

    const token = user.token;

    try {
      const [statsData, neighborhoodData, dayCountData, mapPointsData] =
        await Promise.all([
          getReportsStatistics(token, typeFilter, timeFilter).catch((err) => {
            console.warn("Aviso al cargar estadísticas:", err);
            return null;
          }),
          getReportsCountByNeighborhood(token, typeFilter, timeFilter).catch(
            (err) => {
              console.warn("Aviso al cargar conteo de colonias:", err);
              return [] as NeighborhoodReportCount[];
            }
          ),
          getReportsCountByDay(token, typeFilter).catch((err) => {
            console.warn("Aviso al cargar conteo por día:", err);
            return null;
          }),
          getReportsMapPoints(token, typeFilter, timeFilter).catch((err) => {
            console.warn("Aviso al cargar puntos de mapa:", err);
            return [] as ReportMapPoint[];
          }),
        ]);
      setStats(statsData);
      setNeighborhoods(neighborhoodData || []);
      setReportsByDay(dayCountData);
      setMapPoints(mapPointsData || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(
        "No se pudieron cargar los datos del dashboard. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadData(reportTypeFilter, timeRangeFilter);
    }
  }, [user, reportTypeFilter, timeRangeFilter]);

  // Escuchar nuevos reportes emitidos en tiempo real por WebSockets
  useEffect(() => {
    if (!lastReportEvent?.report) return;

    const rep = lastReportEvent.report;
    if (rep.latitude && rep.longitude) {
      const newPoint: ReportMapPoint = {
        report_id: rep.report_id,
        latitude: rep.latitude,
        longitude: rep.longitude,
        typereport: rep.typereport,
        status: rep.status,
        date: rep.date,
        problem: null,
        neighborhood: "Nueva Incidencia",
      };

      setMapPoints((prev) => {
        if (prev.some((p) => p.report_id === newPoint.report_id)) {
          return prev;
        }
        return [newPoint, ...prev];
      });

      setNewReportPing(newPoint);

      // Refrescar estadísticas en segundo plano si hay sesión
      if (user?.token) {
        getReportsStatistics(user.token, reportTypeFilter, timeRangeFilter)
          .then((s) => setStats(s))
          .catch(() => {});
        getReportsCountByDay(user.token, reportTypeFilter)
          .then((d) => setReportsByDay(d))
          .catch(() => {});
      }
    }
  }, [lastReportEvent, user, reportTypeFilter, timeRangeFilter]);

  const handleTypeFilterChange = (type: ReportTypeFilter) => {
    setReportTypeFilter(type);
  };

  const handleTimeRangeFilterChange = (timeRange: TimeRangeFilterState) => {
    setTimeRangeFilter(timeRange);
  };

  const effectiveStats = useMemo(() => {
    if (stats && stats.total_reports > 0) return stats;
    return SAMPLE_STATS;
  }, [stats]);

  const pieChartData = useMemo(() => {
    if (!effectiveStats || !effectiveStats.by_status) return [];

    return Object.entries(effectiveStats.by_status)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        name:
          status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
        value: value,
        color: STATUS_COLORS[status] || "#6c757d",
      }))
      .sort((a, b) => b.value - a.value);
  }, [effectiveStats]);

  const barChartData = useMemo(() => {
    const rawData = reportsByDay || {
      lunes: 2,
      martes: 1,
      miercoles: 3,
      jueves: 0,
      viernes: 2,
      sabado: 0,
      domingo: 0,
    };

    const dayOrder: Array<keyof ReportCountByDay> = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];

    return dayOrder.map((dayKey) => {
      const dayStr = String(dayKey);
      return {
        day: dayStr.charAt(0).toUpperCase() + dayStr.slice(1),
        count: rawData[dayKey] || 0,
      };
    });
  }, [reportsByDay]);

  const topNeighborhoods = useMemo(() => {
    if (neighborhoods && neighborhoods.length > 0) {
      return [...neighborhoods]
        .sort((a, b) => b.reports_counted - a.reports_counted)
        .slice(0, 5);
    }
    return [
      { neighborhood: "Centro", reports_counted: 4 },
      { neighborhood: "Ánimas", reports_counted: 2 },
      { neighborhood: "Los Sauces", reports_counted: 1 },
      { neighborhood: "Coapexpan", reports_counted: 1 },
    ];
  }, [neighborhoods]);

  if (loading) {
    return (
      <ProtectedPage permission="resumen">
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  if (error) {
    return (
      <ProtectedPage permission="resumen">
        <div className="alert alert-danger m-4" role="alert">
          {error}
        </div>
      </ProtectedPage>
    );
  }

  const total_reports = stats?.total_reports || 0;
  const bacheoCount = stats?.by_type?.BACHE || stats?.by_type?.BACHEO || 0;
  const alumbradoCount = stats?.by_type?.ALUM || stats?.by_type?.ALUMBRADO || 0;

  const inReviewCount = stats?.by_status?.["REVISION"] || 0;
  const inProcessCount = stats?.by_status?.["PROCESO"] || 0;
  const approvedCount = stats?.by_status?.["APROBADO"] || 0;
  const closedCount = stats?.by_status?.["CIERRE"] || 0;
  const completedCount = stats?.by_status?.["COMPLETADO"] || 0;
  const notApprovedCount = stats?.by_status?.["NO APROBADO"] || stats?.by_status?.["NO_APROBADO"] || 0;

  const completedTotal = completedCount + closedCount;
  const inProcessTotal = inReviewCount + inProcessCount;
  const totalApproved = approvedCount;

  return (
    <ProtectedPage permission="resumen">
      <div className="container-fluid py-4">
        <div className="bg-white rounded-4 shadow-sm p-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
            <h4 className="fw-bold m-0 text-dark">Panel Administrador</h4>
            <div className="d-flex flex-wrap gap-2">
              {TIME_RANGE_MAP.map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => handleTimeRangeFilterChange(value)}
                  className={`btn btn-sm ${
                    timeRangeFilter === value
                      ? "btn-dark"
                      : "btn-outline-secondary"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h6 className="text-muted">Seleccione el tipo de reporte</h6>
            <div className="d-flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilterChange(null)}
                className={`btn btn-sm ${
                  reportTypeFilter === null
                    ? "btn-dark"
                    : "btn-outline-secondary"
                }`}>
                Todos
              </button>
              <button
                onClick={() => handleTypeFilterChange("BACHE")}
                className={`btn btn-sm ${
                  reportTypeFilter === "BACHE"
                    ? "btn-dark"
                    : "btn-outline-secondary"
                }`}>
                Bache
              </button>
              <button
                onClick={() => handleTypeFilterChange("ALUM")}
                className={`btn btn-sm ${
                  reportTypeFilter === "ALUM"
                    ? "btn-dark"
                    : "btn-outline-secondary"
                }`}>
                Alumbrado
              </button>
            </div>
          </div>
          <hr />
          <div className="mb-4">
            <ReportsMap
              points={mapPoints}
              loading={loading}
              selectedType={reportTypeFilter}
              newReportPing={newReportPing}
            />
          </div>
          <hr />
          <div className="mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title fw-semibold">
                  Reportes por Día (Semana Actual)
                </h5>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {reportTypeFilter === "BACHE"
                    ? "Solo reportes de Bacheo"
                    : reportTypeFilter === "ALUM"
                    ? "Solo reportes de Alumbrado"
                    : "Todos los reportes"}
                </p>
                <div className="mt-3">
                  <BarChart data={barChartData} />
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body">
                  <h5 className="card-title fw-semibold">
                    Reportes por estado
                  </h5>
                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-between mt-4 gap-4">
                    <div
                      className="d-flex flex-column gap-3 mb-4 mb-md-0"
                      style={{ minWidth: "160px" }}>
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-warning"
                          style={{ fontSize: "0.9rem" }}>
                          En revisión / Proceso
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}>
                          {inProcessTotal} totales
                        </p>
                      </div>
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-success"
                          style={{ fontSize: "0.9rem" }}>
                          Aprobados
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}>
                          {totalApproved} totales
                        </p>
                      </div>
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-primary"
                          style={{ fontSize: "0.9rem" }}>
                          Completados / Cierre
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}>
                          {completedTotal} totales
                        </p>
                      </div>
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-danger"
                          style={{ fontSize: "0.9rem" }}>
                          No Aprobados
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}>
                          {notApprovedCount} totales
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-4 flex-grow-1">
                      <PieChart data={pieChartData} />
                      <ul
                        className="list-unstyled m-0"
                        style={{ fontSize: "0.85rem" }}>
                        {pieChartData.map((item, index) => (
                          <li
                            key={index}
                            className="d-flex align-items-center mb-1">
                            <span
                              className="d-inline-block rounded-circle me-2"
                              style={{
                                backgroundColor: item.color,
                                width: "10px",
                                height: "10px",
                              }}></span>
                            {item.name}: {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column justify-content-center p-4">
                  <h5 className="card-title fw-semibold">Total de reportes</h5>
                  <div className="mt-3">
                    <p className="m-0 fs-5 fw-bold text-dark">
                      {total_reports} reportes totales
                    </p>
                    <p className="m-0 text-muted">
                      <i className="bi bi-water text-primary me-2"></i>
                      {bacheoCount} reportes de bacheo
                    </p>
                    <p className="m-0 text-muted">
                      <i className="bi bi-lightbulb-fill text-warning me-2"></i>
                      {alumbradoCount} reportes de alumbrado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-semibold mb-3">
                    Colonias con mayor número de reportes
                  </h5>

                  <ol className="list-unstyled m-0">
                    {topNeighborhoods.map((item, index) => (
                      <li
                        key={index}
                        className="mb-1"
                        style={{ fontSize: "0.95rem" }}>
                        <span className="fw-bold me-2">{index + 1}.</span>
                        {item.neighborhood}:{" "}
                        <span className="fw-bold">{item.reports_counted}</span>{" "}
                        reportes
                      </li>
                    ))}
                    {topNeighborhoods.length === 0 && (
                      <p className="text-muted">
                        No hay datos de conteo de reportes por colonia.
                      </p>
                    )}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
