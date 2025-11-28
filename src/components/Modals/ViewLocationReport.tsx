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
      style={{
        backdropFilter: "blur(3px)",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* HEADER */}
          <div className="modal-header bg-white border-bottom-0">
            <h4 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Ubicación del reporte
            </h4>
          </div>

          {/* BODY */}
          <div className="px-3 pb-3">
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger text-center">{error}</div>
            )}

            {!loading && !error && (
              <div
                style={{
                  height: "400px",
                  width: "100%",
                  borderRadius: "15px",
                  overflow: "hidden",
                }}
              >
                <Map lat={latitude} lng={longitude} zoom={24} />
              </div>
            )}
          </div>

          {/* FOOTER */}
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
