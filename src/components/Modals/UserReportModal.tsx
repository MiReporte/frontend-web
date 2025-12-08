"use client";

import { UserReportsResponse, ReportItem } from "@/utils/types";

interface Props {
  show: boolean;
  loading: boolean;
  reports: UserReportsResponse | null;
  onClose: () => void;
}

export default function UserReportsModal({
  show,
  loading,
  reports,
  onClose,
}: Props) {
  if (!show) return null;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "En revisión": "#F59E0B",
      "En proceso": "#FF7800",
      Aprobado: "#16A34A",
      "No aprobado": "#DC2626",
      Completado: "#2563EB",
      Cerrado: "#9333EA",
    };

    return (
      <span
        className="badge rounded-pill px-3 text-white"
        style={{
          backgroundColor: colors[status] || "#6B7280",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* HEADER */}
          <div
            className="modal-header text-white px-4 py-3"
            style={{ backgroundColor: "#611232" }}
          >
            <h5 className="modal-title fw-bold">Reportes del Ciudadano</h5>
          </div>

          {/* BODY */}
          <div className="modal-body px-4 py-4 bg-light">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-danger mb-3"></div>
                <p className="text-muted fw-medium">Cargando reportes...</p>
              </div>
            ) : !reports || reports.items.length === 0 ? (
              <div className="alert alert-info text-center py-4 rounded-3 shadow-sm">
                Este usuario no ha realizado reportes.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle shadow-sm border bg-white rounded-3 overflow-hidden">
                  <thead className="table-light">
                    <tr className="text-secondary">
                      <th>ID</th>
                      <th>Asunto</th>
                      <th>Tipo</th>
                      <th>Estatus</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.items.map((r: ReportItem) => (
                      <tr key={r.report_id}>
                        <td className="fw-semibold">{r.report_id}</td>
                        <td>{r.asunto}</td>
                        <td>
                          <span className="badge bg-warning rounded-pill px-3">
                            {r.typereport}
                          </span>
                        </td>
                        <td>{getStatusBadge(r.status)}</td>
                        <td>
                          {new Date(r.date).toLocaleString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top px-4 py-3 bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4 me-2"
              onClick={onClose}
            >
              Cerrar
            </button>

            <button
              type="button"
              className="btn text-white rounded-pill px-4 fw-bold shadow-sm"
              style={{ backgroundColor: "#611232" }}
              onClick={onClose}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
