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
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow rounded-4 py-2">
          <div className="modal-body px-4 py-2">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-muted">Obteniendo datos...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                {error}
              </div>
            ) : reportData ? (
              <div className="container-fluid">
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <label className="text-muted small fw-bold text-uppercase">
                      Tipo
                    </label>
                    <p className="fs-6 mb-0 text-dark">{reportData.asunto}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="text-muted small fw-bold text-uppercase">
                      Estado
                    </label>
                    <p className="fs-6 mb-0 text-dark">{reportData.status}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="text-muted small fw-bold text-uppercase">
                      Fecha
                    </label>
                    <p className="fs-6 mb-0 text-dark">
                      {new Date(reportData.date).toLocaleString("es-MX", {
                        dateStyle: "long",
                      })}
                    </p>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="mb-4">
                      <label className="text-muted small fw-bold text-uppercase">
                        Ubicación
                      </label>
                      <div className="d-flex align-items-center gap-2 bg-light p-2 rounded">
                        <p className="mb-0 small text-secondary">{address}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-muted small fw-bold text-uppercase">
                        Descripción Ciudadana
                      </label>
                      <div className="d-flex align-items-center gap-2 bg-light p-2 rounded">
                        <p className="mb-0 fst-italic text-dark">
                          {reportData.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-5">
                    <label className="text-muted small fw-bold text-uppercase mb-2">
                      Evidencia
                    </label>
                    <div className="ratio ratio-1x1 bg-light rounded-3 overflow-hidden border position-relative">
                      {reportData.evidence &&
                      typeof reportData.evidence === "string" &&
                      reportData.evidence.startsWith("http") ? (
                        <Image
                          src={reportData.evidence}
                          alt="Evidencia"
                          fill
                          className="object-fit-cover"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                          <small>Sin evidencia fotográfica</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="modal-footer border-top-0 justify-content-center">
            <button
              type="button"
              className="btn text-white rounded-pill px-4 fw-bold"
              style={{ backgroundColor: "#611232", border: "none" }}
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
