"use client";

import { useEffect, useState, useMemo } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { getReportsStatistics } from "@/services/getReportsStatistics";
import { getReportsCountByNeighborhood } from "@/services/getReportsCountByNeighborhood";
import { ReportStatistics, NeighborhoodReportCount } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";

// --- Componente funcional para el Gráfico Circular (SVG) ---
// Implementación de gráfica de dona funcional con SVG, con dimensiones optimizadas.
const PieChart = ({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) => {
  // Aumentamos el tamaño del contenedor, manteniendo el aspecto 1:1
  const size = 220;

  // --- SVG Logic ---
  // ViewBox: 100x100.
  const radius = 35; // Radio de la línea central del anillo (donut)
  const strokeWidth = 30; // Grosor del anillo (para que el radio externo sea 50)
  const circumference = 2 * Math.PI * radius;

  // Calcula el total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // No renderizar si no hay datos o el total es cero
  if (total === 0 || data.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-light rounded"
        style={{ width: size, height: size, aspectRatio: 1 }}
      >
        <p className="m-0 text-muted" style={{ fontSize: "0.9rem" }}>
          Sin Datos
        </p>
      </div>
    );
  }

  return (
    // Contenedor flexible para centrar el gráfico grande
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Genera las secciones de la gráfica */}
        {data.map((item, index) => {
          const percent = item.value / total;
          // Solo dibuja el segmento si el valor es positivo
          if (percent <= 0) return null;

          // Calculate cumulative percent from previous items
          const cumulativePercent = data
            .slice(0, index)
            .reduce((sum, prevItem) => {
              return sum + prevItem.value / total;
            }, 0);

          const strokeDasharray = `${percent * circumference} ${circumference}`;
          const strokeDashoffset = `${cumulativePercent * circumference}`;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r={radius} // Usamos el radio de la línea central
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth} // Usamos el grosor para el anillo
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

        {/* Círculo central blanco para el texto de conteo */}
        <circle cx="50" cy="50" r={20} fill="#fff" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#343a40"
        >
          {total}
        </text>
        <text x="50" y="65" textAnchor="middle" fontSize="6" fill="#6c757d">
          Reportes
        </text>
      </svg>
    </div>
  );
};

// --- Componente principal ---

export default function ResumenPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReportStatistics | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodReportCount[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const STATUS_COLORS: { [key: string]: string } = {
    REVISION: "#F59E0B", // Naranja (En revisión)
    APROBADO: "#16A34A", // Verde (Aprobado)
    CIERRE: "#9333EA", // Morado (Cierre)
    COMPLETADO: "#2563EB", // Azul (Completado)
    NO_APROBADO: "#DC2626", // Rojo (No Aprobado)
    PROCESO: "#ff7800", // Naranja más claro (En proceso)
  };

  useEffect(() => {
    async function loadData() {
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
        const [statsData, neighborhoodData] = await Promise.all([
          getReportsStatistics(token),
          getReportsCountByNeighborhood(token),
        ]);
        setStats(statsData);
        setNeighborhoods(neighborhoodData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(
          "No se pudieron cargar los datos del dashboard. Inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  // Prepara los datos para la gráfica de pastel y la leyenda
  const pieChartData = useMemo(() => {
    if (!stats || !stats.by_status) return [];

    // Filtra los estados con valor > 0
    return Object.entries(stats.by_status)
      .filter(([, value]) => value > 0)
      .map(([status, value]) => ({
        // Formato "Revision"
        name:
          status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
        value: value,
        color: STATUS_COLORS[status] || "#6c757d",
      }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  // Prepara los datos de las colonias (ordenados y limitados a los 5 primeros)
  const topNeighborhoods = useMemo(() => {
    return neighborhoods
      .sort((a, b) => b.reports_counted - a.reports_counted)
      .slice(0, 5);
  }, [neighborhoods]);

  // Manejo de estado de carga y error (sin cambios)
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

  // Desestructuración de los datos para facilitar la lectura
  const { total_reports, by_type, by_status } = stats!;
  const bacheoCount = by_type.BACHE || 0;
  const alumbradoCount = by_type.ALUM || 0;

  // Lógica de conteo de estados para la sección de resumen
  const inReviewCount = by_status["REVISION"] || 0;
  const inProcessCount = by_status["PROCESO"] || 0;
  const approvedCount = by_status["APROBADO"] || 0;
  const closedCount = by_status["CIERRE"] || 0;
  const completedCount = by_status["COMPLETADO"] || 0;
  const notApprovedCount = by_status["NO_APROBADO"] || 0;

  // Totales para la sección de resumen de estados
  const completedTotal = completedCount + closedCount;
  const inProcessTotal = inReviewCount + inProcessCount;
  const totalApproved = approvedCount;

  return (
    <ProtectedPage permission="resumen">
      <div className="container-fluid py-4">
        <div className="bg-white rounded-4 shadow-sm p-4">
          {/* Encabezado y Filtros (sin cambios) */}
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
            <h4 className="fw-bold m-0 text-dark">Panel Administrador</h4>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-sm btn-dark">Hoy</button>
              <button className="btn btn-sm btn-outline-secondary">
                Última semana
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                Último mes
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                Últimos 6 meses
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                Último año
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                Todo el tiempo
              </button>
            </div>
          </div>
          <div className="mb-4">
            <h6 className="text-muted">Seleccione el tipo de reporte</h6>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-sm btn-dark">Todos</button>
              <button className="btn btn-sm btn-outline-secondary">
                Bache
              </button>
              <button className="btn btn-sm btn-outline-secondary">
                Alumbrado
              </button>
            </div>
          </div>

          <hr />

          {/* Gráficas y Totales */}
          <div className="row g-4">
            {/* Reportes por estado (Gráfico y Detalles) */}
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-semibold">
                    Reportes por estado
                  </h5>

                  <div className="d-flex flex-column flex-md-row align-items-center justify-content-around mt-4 gap-4">
                    {/* Sección de Resumen de Estados (Lado Izquierdo) */}
                    <div
                      className="d-flex flex-column gap-3 mb-4 mb-md-0"
                      style={{ minWidth: "160px" }}
                    >
                      {/* En Revisión y Proceso */}
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-warning"
                          style={{ fontSize: "0.9rem" }}
                        >
                          En revisión / Proceso
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {inProcessTotal} totales
                        </p>
                      </div>

                      {/* Aprobados */}
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-success"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Aprobados
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {totalApproved} totales
                        </p>
                      </div>

                      {/* Completados y Cierre */}
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-primary"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Completados / Cierre
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {completedTotal} totales
                        </p>
                      </div>

                      {/* No Aprobados */}
                      <div className="d-flex flex-column">
                        <p
                          className="m-0 fw-semibold text-danger"
                          style={{ fontSize: "0.9rem" }}
                        >
                          No Aprobados
                        </p>
                        <p
                          className="m-0 text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          {notApprovedCount} totales
                        </p>
                      </div>
                    </div>

                    {/* Gráfico y Leyenda (Centro y Derecha) */}
                    <div className="d-flex align-items-center gap-4 flex-wrap justify-content-center">
                      <PieChart data={pieChartData} />

                      {/* Leyenda del gráfico */}
                      <ul
                        className="list-unstyled m-0"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {pieChartData.map((item, index) => (
                          <li
                            key={index}
                            className="d-flex align-items-center mb-1"
                          >
                            <span
                              className="d-inline-block rounded-circle me-2"
                              style={{
                                backgroundColor: item.color,
                                width: "10px",
                                height: "10px",
                              }}
                            ></span>
                            {item.name}: {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total de reportes (Columna derecha) */}
            <div className="col-12 col-lg-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body d-flex flex-column justify-content-center">
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

            {/* Colonias con mayor número de reportes (Restaurado) */}
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
                        style={{ fontSize: "0.95rem" }}
                      >
                        <span className="fw-bold me-2">{index + 1}.</span>
                        {item.neighborhood}: {item.reports_counted} reportes
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
