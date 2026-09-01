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

function StatusTimeline({
  status,
  history,
}: {
  status: string;
  history: Record<string, string>;
}) {
  const steps = [
    "En revisión",
    "Aprobado",
    "En proceso",
    "Completado",
    "No aprobado",
    "Cerrado",
  ];

  const order: Record<string, number> = {
    "En revisión": 1,
    Aprobado: 2,
    "En proceso": 3,
    Completado: 4,
    "No aprobado": 5,
    Cerrado: 6,
  };

  return (
    <div className="mt-4">
      <h6 className="text-uppercase text-muted small fw-bold mb-3">
        Seguimiento del Reporte
      </h6>

      <div className="ps-2 position-relative">
        {steps.map((step, index) => {
          const isCurrent = order[step] === order[status];
          const isInHistory = !!history?.[step];
          const isCompleted = isInHistory && !isCurrent;

          return (
            <div key={step} className="d-flex mb-4 position-relative">
              {index < steps.length - 1 && (
                <div
                  className="position-absolute"
                  style={{
                    left: "6px",
                    top: "20px",
                    width: "2px",
                    height: "100%",
                    backgroundColor: isCompleted ? "#611232" : "#d1d5db",
                    zIndex: 0,
                  }}
                />
              )}

              <div
                style={{
                  width: "14px",
                  height: "14px",
                  backgroundColor: isCurrent
                    ? "#611232"
                    : isCompleted
                    ? "#611232"
                    : "#d1d5db",
                  borderRadius: "50%",
                  marginRight: "12px",
                  zIndex: 2,
                }}
              />

              <div>
                <p
                  className="fw-semibold mb-1"
                  style={{
                    color: isCurrent
                      ? "#611232"
                      : isCompleted
                      ? "#374151"
                      : "#9ca3af",
                  }}
                >
                  {step}
                </p>

                {history?.[step] && (
                  <small className="text-muted">
                    {new Date(history[step]).toLocaleString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ReportModal({ reportId, onClose }: ReportProps) {
  const { user } = useAuth();

  const [reportData, setReportData] = useState<GetReportByIdResponse | null>(
    null
  );
  // Active selected image index for the gallery preview
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

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

      try {
        setLoading(true);
        const data = await getReportById(reportId, user.token);

        if (!data) {
          setError("No se pudo obtener el reporte");
          setLoading(false);
          return;
        }

        setReportData(data);
        setSelectedImageIndex(0);

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
      } catch (err) {
        setError("Error obteniendo datos del reporte");
      }

      setLoading(false);
    };

    run();
  }, [reportId, user?.token]);

  // Compute available images list from reportData
  const evidenceImages: string[] = reportData
    ? reportData.evidences && reportData.evidences.length > 0
      ? reportData.evidences
      : ([
          reportData.evidence1 || reportData.evidence,
          reportData.evidence2,
          reportData.evidence3,
        ].filter(Boolean) as string[])
    : [];

  const currentPreviewImage =
    evidenceImages[selectedImageIndex] || evidenceImages[0] || null;

  // Handlers for previous and next image navigation
  const handlePrevImage = () => {
    if (evidenceImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev > 0 ? prev - 1 : evidenceImages.length - 1
    );
  };

  const handleNextImage = () => {
    if (evidenceImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev < evidenceImages.length - 1 ? prev + 1 : 0
    );
  };

  // Keyboard navigation support for left/right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (evidenceImages.length <= 1) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [evidenceImages.length]);

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
                <div className="spinner-border text-danger mb-3" />
                <p className="text-muted fw-medium">
                  Recuperando información...
                </p>
              </div>
            ) : error ? (
              <div className="p-4">
                <div className="alert alert-danger">{error}</div>
              </div>
            ) : reportData ? (
              <div className="container-fluid p-3">
                <div className="mb-2 justify-content-between d-flex">
                  <span>
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
                  </span>
                  <span>
                    <p className="text-secondary small fw-medium mb-4">
                      <i className="bi bi-calendar-event me-1" />
                      {new Date(reportData.date).toLocaleString("es-MX")}
                    </p>
                  </span>
                </div>

                <h6 className="text-muted text-uppercase small fw-bold mb-2">
                  Reportado Por
                </h6>
                <p className="fw-bold fs-6">
                  {reportData.name_report_user}{" "}
                  {reportData.first_surname_report_user}{" "}
                  {reportData.second_surname_report_user}
                </p>

                <h6 className="text-muted text-uppercase small fw-bold mt-4 mb-2">
                  Ubicación del incidente
                </h6>
                <p className="text-secondary small">{address}</p>

                <h6 className="text-muted text-uppercase small fw-bold mt-4 mb-2">
                  Asunto
                </h6>
                <p className="text-secondary small">{reportData.asunto}</p>

                <h6 className="text-muted text-uppercase small fw-bold mt-4 mb-2">
                  Descripción
                </h6>
                <div className="p-3 bg-light rounded-3 border">
                  <p className="mb-0">{reportData.description}</p>
                </div>

                <StatusTimeline
                  status={reportData.status}
                  history={reportData.status_history}
                />

                {/* Evidence Section Header */}
                <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
                  <h6 className="text-muted text-uppercase small fw-bold mb-0">
                    Evidencias ({evidenceImages.length})
                  </h6>
                  {currentPreviewImage && (
                    <a
                      href={currentPreviewImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <i className="bi bi-box-arrow-up-right" />
                      Ver original
                    </a>
                  )}
                </div>

                {currentPreviewImage ? (
                  <div>
                    {/* Main Featured Image Container with Isolated Ratio and Overlay Controls */}
                    <div className="position-relative bg-dark rounded-3 overflow-hidden border shadow-sm mb-3">
                      {/* Image Ratio Container (only contains Image to avoid Bootstrap .ratio > * stretching child controls) */}
                      <div className="ratio ratio-16x9">
                        <Image
                          src={currentPreviewImage}
                          alt={`Evidencia ${selectedImageIndex + 1}`}
                          fill
                          className="object-fit-contain"
                        />
                      </div>

                      {/* Side navigation arrows (rendered when more than 1 image is available) */}
                      {evidenceImages.length > 1 && (
                        <>
                          {/* Previous image button */}
                          <button
                            type="button"
                            onClick={handlePrevImage}
                            aria-label="Imagen anterior"
                            className="btn btn-dark bg-opacity-75 position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle d-flex align-items-center justify-content-center border-0 text-white shadow"
                            style={{
                              width: "38px",
                              height: "38px",
                              zIndex: 10,
                              cursor: "pointer",
                            }}
                          >
                            <i className="bi bi-chevron-left fs-5" />
                          </button>

                          {/* Next image button */}
                          <button
                            type="button"
                            onClick={handleNextImage}
                            aria-label="Siguiente imagen"
                            className="btn btn-dark bg-opacity-75 position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle d-flex align-items-center justify-content-center border-0 text-white shadow"
                            style={{
                              width: "38px",
                              height: "38px",
                              zIndex: 10,
                              cursor: "pointer",
                            }}
                          >
                            <i className="bi bi-chevron-right fs-5" />
                          </button>

                          {/* Image position counter badge */}
                          <div
                            className="position-absolute bottom-0 start-50 translate-middle-x mb-2 px-3 py-1 rounded-pill bg-dark bg-opacity-75 text-white small"
                            style={{
                              fontSize: "0.75rem",
                              zIndex: 10,
                              pointerEvents: "none",
                            }}
                          >
                            {selectedImageIndex + 1} / {evidenceImages.length}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Interactive Thumbnails for multiple images (1-3 images) */}
                    {evidenceImages.length > 1 && (
                      <div className="d-flex gap-2 pb-1">
                        {evidenceImages.map((imgUrl, index) => {
                          const isSelected = selectedImageIndex === index;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedImageIndex(index)}
                              className={`btn p-0 rounded-3 overflow-hidden position-relative transition-all ${
                                isSelected
                                  ? "border border-3 border-danger shadow"
                                  : "border opacity-75"
                              }`}
                              style={{
                                width: "80px",
                                height: "80px",
                                outline: "none",
                              }}
                            >
                              <Image
                                src={imgUrl}
                                alt={`Miniatura evidencia ${index + 1}`}
                                fill
                                className="object-fit-cover"
                              />
                              <span
                                className="position-absolute bottom-0 end-0 badge bg-dark bg-opacity-75 rounded-0 rounded-top-start small"
                                style={{ fontSize: "0.65rem" }}
                              >
                                #{index + 1}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded-3 text-center text-muted small border">
                    Sin evidencia fotográfica disponible
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="modal-footer border-top px-4 py-3 bg-light">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={onClose}
            >
              Cerrar
            </button>

            <button
              type="button"
              className="btn text-white rounded-pill px-4 fw-bold"
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
