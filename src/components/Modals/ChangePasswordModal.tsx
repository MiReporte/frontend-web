"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { updatePassword } from "@/services/updatePassword";
import { validatePassword } from "@/utils/Validator";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword.trim()) {
      setError("Por favor ingresa tu contraseña actual.");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("La nueva contraseña y su confirmación no coinciden.");
      return;
    }

    if (oldPassword === newPassword) {
      setError("La nueva contraseña debe ser diferente a la actual.");
      return;
    }

    if (!user?.token) return;

    try {
      setLoading(true);
      await updatePassword(user.token, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess("Contraseña actualizada correctamente.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar la contraseña."
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
              Cambiar contraseña
            </h5>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              {success && <div className="alert alert-success py-2">{success}</div>}

              {/* Contraseña actual */}
              <div className="mb-3">
                <label className="form-label fw-medium">Contraseña actual</label>
                <div className="input-group">
                  <input
                    type={showOld ? "text" : "password"}
                    className="form-control"
                    placeholder="Ingresa tu contraseña actual"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowOld(!showOld)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showOld ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="mb-3">
                <label className="form-label fw-medium">Nueva contraseña</label>
                <div className="input-group">
                  <input
                    type={showNew ? "text" : "password"}
                    className="form-control"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNew(!showNew)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Confirmar nueva contraseña
                </label>
                <div className="input-group">
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    placeholder="Repite la nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirm(!showConfirm)}
                    disabled={loading}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
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
                type="submit"
                className="btn text-white rounded-pill px-5 fw-medium"
                style={{ backgroundColor: "#611232" }}
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Cambiar contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
