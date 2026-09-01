"use client";

import { useState } from "react";
import Map from "@/components/Map";

interface ReportProps {
  latitude: number;
  longitude: number;
  onClose: () => void;
}

export function ViewLocationReport({
  latitude,
  longitude,
  onClose,
}: ReportProps) {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* HEADER */}
          <div
            className="modal-header text-white px-4 py-3"
            style={{ backgroundColor: "#611232" }}
          >
            <h5 className="modal-title fw-bold">Ubicación del Reporte</h5>
          </div>

          {/* BODY */}
          <div className="modal-body bg-light px-4 py-4">
            {loading && (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-danger mb-3"></div>
                <p className="text-muted fw-medium">Cargando mapa...</p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}

            {!loading && !error && (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div
                  style={{
                    height: "40vh",
                    minHeight: "260px",
                    maxHeight: "400px",
                    width: "100%",
                  }}
                >
                  <Map lat={latitude} lng={longitude} zoom={18} />
                </div>
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
