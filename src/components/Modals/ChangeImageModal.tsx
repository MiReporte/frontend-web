"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { updateProfileImage } from "@/services/updateProfileImage";

interface ChangeImageModalProps {
  onClose: () => void;
  onUpdated: (newImageUrl: string) => void;
}

export function ChangeImageModal({
  onClose,
  onUpdated,
}: ChangeImageModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido (JPEG, PNG, WebP).");
      return;
    }

    // Optional size check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona una imagen para subir.");
      return;
    }

    if (!user?.token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await updateProfileImage(user.token, selectedFile);
      setSuccess("Foto de perfil actualizada correctamente.");
      setTimeout(() => {
        onUpdated(res.image_url);
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar la foto de perfil."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Cambiar foto de perfil
            </h5>
          </div>

          <div className="modal-body text-center">
            {error && <div className="alert alert-danger py-2 text-start">{error}</div>}
            {success && <div className="alert alert-success py-2 text-start">{success}</div>}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              className="d-none"
              onChange={handleFileChange}
              disabled={loading}
            />

            <div className="d-flex flex-column align-items-center my-3">
              <div
                role="button"
                tabIndex={0}
                className="position-relative rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center border"
                style={{
                  width: "140px",
                  height: "140px",
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                  borderColor: "#611232",
                }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    fileInputRef.current?.click();
                  }
                }}
                title="Haz clic para seleccionar una imagen"
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Vista previa"
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : user?.image ? (
                  <Image
                    src={user.image}
                    alt="Foto actual"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex flex-column align-items-center justify-content-center text-muted"
                    style={{ height: "100%" }}
                  >
                    <i className="bi bi-camera fs-1" style={{ color: "#611232" }}></i>
                  </div>
                )}
                <div
                  className="position-absolute bottom-0 w-100 py-1 text-white text-center"
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    fontSize: "0.75rem",
                  }}
                >
                  <i className="bi bi-pencil-fill me-1"></i> Elegir foto
                </div>
              </div>

              <small className="text-muted mt-2">
                Haz clic en la imagen para buscar un archivo (JPG, PNG, WebP máx. 5MB)
              </small>
            </div>
          </div>

          <div className="modal-footer border-0 justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn text-white rounded-pill px-5 fw-medium"
              style={{ backgroundColor: "#611232" }}
              onClick={handleUpload}
              disabled={loading || !selectedFile}
            >
              {loading && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
