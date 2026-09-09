"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { requestEmailChange, confirmEmailChange } from "@/services/changeEmail";
import { validateEmail } from "@/utils/Validator";

interface ChangeEmailModalProps {
  currentEmail: string;
  onClose: () => void;
  onUpdated: (newEmail: string) => void;
}

export function ChangeEmailModal({
  currentEmail,
  onClose,
  onUpdated,
}: ChangeEmailModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestCode = async () => {
    setError(null);
    const emailErr = validateEmail(newEmail);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (newEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) {
      setError("El nuevo correo electrónico debe ser diferente al actual.");
      return;
    }

    if (!user?.token) return;

    try {
      setLoading(true);
      const res = await requestEmailChange(user.token, { new_email: newEmail.trim() });
      setVerificationToken(res.verification_token);
      setSuccess("Se ha enviado un código de verificación a tu correo actual.");
      setStep(2);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al solicitar el cambio de correo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    setError(null);
    setSuccess(null);
    if (!code || code.length < 6) {
      setError("Por favor ingresa el código de 6 dígitos.");
      return;
    }

    if (!user?.token) return;

    try {
      setLoading(true);
      const response = await confirmEmailChange(user.token, {
        verification_token: verificationToken,
        code: code.trim(),
      });
      setSuccess("Correo electrónico actualizado exitosamente.");
      setTimeout(() => {
        onUpdated(response.new_email || newEmail.trim());
      }, 1200);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Código incorrecto o expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
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
              {step === 1 ? "Cambiar correo electrónico" : "Verificar código"}
            </h5>
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {success && <div className="alert alert-success py-2">{success}</div>}

            {step === 1 && (
              <>
                <div className="mb-3">
                  <label className="form-label text-muted">Correo actual</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={currentEmail}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Nuevo correo electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="ejemplo@correo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-secondary p-0 mb-3"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setSuccess(null);
                    setCode("");
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-1"></i> Volver
                </button>
                <div className="mb-3">
                  <label className="form-label text-muted">Cambiando a</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={newEmail}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Código de verificación</label>
                  <input
                    type="text"
                    className="form-control fs-4 text-center"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                  />
                  <div className="form-text">
                    Ingresa el código de 6 dígitos enviado a tu correo actual.
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer border-0">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            {step === 1 ? (
              <button
                type="button"
                className="btn text-white rounded-pill px-5 fw-medium"
                style={{ backgroundColor: "#611232" }}
                onClick={handleRequestCode}
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Enviar código
              </button>
            ) : (
              <button
                type="button"
                className="btn text-white rounded-pill px-5 fw-medium"
                style={{ backgroundColor: "#611232" }}
                onClick={handleConfirmCode}
                disabled={loading}
              >
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                )}
                Confirmar cambio
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
