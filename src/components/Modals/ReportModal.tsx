"use client";

import { useEffect, useState } from "react";
import { getReportById } from "@/services/getReportById";
import { useAuth } from "@/hooks/useAuth";
import { GetReportByIdResponse } from "@/utils/types";
import { reverseGeocode } from "@/utils/reverseGeocoding";
import Image from "next/image";

interface ReportProps {
  reportId: number;
  onClose: () => void;
}

const addressCache = new Map<string, string>();

export function ReportModal({ reportId, onClose }: ReportProps) {
  const { user } = useAuth();

  const [reportData, setReportData] = useState<GetReportByIdResponse | null>(
    null
  );
  const [address, setAddress] = useState<string>("Cargando ubicación...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user?.token) {
        setError("No hay token de autenticación");
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getReportById(reportId, user.token);

      if (!data) {
        setError("No se pudo obtener la información del reporte");
        setLoading(false);
        return;
      }

      setReportData(data);

      const key = `${data.latitude},${data.longitude}`;
      if (addressCache.has(key)) {
        setAddress(addressCache.get(key) as string);
      } else {
        try {
          const addr = await reverseGeocode(data.latitude, data.longitude);
          addressCache.set(key, addr);
          setAddress(addr);
        } catch {
          setAddress("Sin ubicación disponible");
        }
      }
      setLoading(false);
    };

    run();
  }, [reportId, user?.token]);

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div
            className="modal-header text-white px-4 py-3"
            style={{ backgroundColor: "#611232" }}
          >
            <h5 className="modal-title fw-bold">
              Detalle del Reporte #{reportId}
            </h5>
          </div>

          <div className="modal-body p-0">
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-danger mb-3" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="text-muted fw-medium">
                  Recuperando información...
                </p>
              </div>
            ) : error ? (
              <div className="p-4">
                <div
                  className="alert alert-danger d-flex align-items-center"
                  role="alert"
                >
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              </div>
            ) : reportData ? (
              <div className="container-fluid">
                <div className="row bg-light border-bottom px-4 py-3 align-items-center">
                  <div className="col-md-6 mb-2 mb-md-0">
                    <span className="badge bg-warning me-2 rounded-pill px-3">
                      {reportData.typereport}
                    </span>
                    <span
                      className="badge rounded-pill px-3"
                      style={{
                        backgroundColor:
                          reportData.status === "En revisión"
                            ? "#F59E0B"
                            : reportData.status === "Aprobado"
                            ? "#16A34A"
                            : reportData.status === "No aprobado"
                            ? "#DC2626"
                            : reportData.status === "En proceso"
                            ? "#ff7800"
                            : reportData.status === "Completado"
                            ? "#2563EB"
                            : reportData.status === "Cerrado"
                            ? "#9333EA"
                            : "#6B7280",
                        color: "#fff",
                      }}
                    >
                      {reportData.status}
                    </span>
                  </div>
                  <div className="col-md-6 text-md-end text-secondary small fw-medium">
                    <i className="bi bi-calendar-event me-1"></i>
                    {new Date(reportData.date).toLocaleString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </div>
                </div>

                <div className="p-4">
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">
                        Información del Ciudadano
                      </h6>
                      <div className="card border-0 bg-light rounded-3 p-3">
                        <p className="mb-1 fw-bold text-dark fs-5">
                          {reportData.name_report_user}{" "}
                          {reportData.first_surname_report_user}{" "}
                          {reportData.second_surname_report_user}
                        </p>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">
                        Ubicación del Incidente
                      </h6>
                      <div className="card border-0 bg-light rounded-3 p-3 h-100 d-flex justify-content-center">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-geo-alt-fill text-danger me-2 mt-1"></i>
                          <p className="mb-0 text-secondary small lh-sm">
                            {address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">
                      Asunto
                    </h6>
                    <p className="fs-5 fw-semibold text-dark mb-0">
                      {reportData.asunto}
                    </p>
                  </div>

                  <div className="row g-4">
                    <div className="col-lg-7">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">
                        Descripción Detallada
                      </h6>
                      <div className="p-3 bg-light rounded-3 border">
                        <p
                          className="mb-0 text-dark"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {reportData.description}
                        </p>
                      </div>
                    </div>

                    <div className="col-lg-5">
                      <h6 className="text-uppercase text-muted small fw-bold mb-2">
                        Evidencia Fotográfica
                      </h6>
                      <div
                        className="ratio ratio-4x3 bg-light rounded-3 overflow-hidden border position-relative shadow-sm"
                        style={{ minHeight: "200px" }}
                      >
                        {reportData.evidence &&
                        typeof reportData.evidence === "string" &&
                        reportData.evidence.startsWith("http") ? (
                          <Image
                            src={reportData.evidence}
                            alt="Evidencia del reporte"
                            fill
                            className="object-fit-cover hover-zoom"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                            <i className="bi bi-image-alt fs-1 mb-2 opacity-25"></i>
                            <small>No hay imagen disponible</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

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
