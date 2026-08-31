"use client";

import { useState, useEffect } from "react";
import { updateStatus } from "@/services/updateState";
import { useAuth } from "@/hooks/useAuth";
import styles from "@/components/NewStatusSelector.module.css";
import { ConfirmUpdate } from "@/components/Modals/UpdateStatusModal";
import { Alert } from "@/components/Modals/AlertModal";

const UI_STATUS = [
  "En revisión",
  "Aprobado",
  "No aprobado",
  "En proceso",
  "Completado",
  "Cerrado",
];

const STATUS_API: Record<string, string> = {
  "En revisión": "REVISION",
  Aprobado: "APROBADO",
  "No aprobado": "NO_APROBADO",
  "En proceso": "PROCESO",
  Completado: "COMPLETADO",
  Cerrado: "CIERRE",
};

const API_TO_UI: Record<string, string> = {
  REVISION: "En revisión",
  APROBADO: "Aprobado",
  NO_APROBADO: "No aprobado",
  PROCESO: "En proceso",
  COMPLETADO: "Completado",
  CIERRE: "Cerrado",
};

const PERMISSION_REQUIRED: Record<string, string[]> = {
  Administrador: [
    "REVISION",
    "APROBADO",
    "NO_APROBADO",
    "PROCESO",
    "COMPLETADO",
    "CIERRE",
  ],
  "Supervisor tecnico": ["PROCESO", "COMPLETADO", "CIERRE"],
  "Mesa de servicios": ["REVISION", "APROBADO", "NO_APROBADO", "CIERRE"],
};

interface Props {
  reportId: number;
  currentStatus: string;
  onUpdated?: (newStatus: string) => void;
}

export function NewStateSelector({
  reportId,
  currentStatus,
  onUpdated,
}: Props) {
  const { user } = useAuth();
  const [status, setStatus] = useState(
    API_TO_UI[currentStatus] || currentStatus
  );
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(API_TO_UI[currentStatus] || currentStatus);
  }, [currentStatus]);

  const handleChange = (newStatusUI: string) => {
    if (!user) return;

    const allowed = PERMISSION_REQUIRED[user.role];
    if (!allowed) {
      setAlertMessage("No tienes permiso para cambiar estados.");
      return;
    }

    if (!allowed.includes(STATUS_API[newStatusUI])) {
      setAlertMessage("No tienes permiso para cambiar a este estado.");
      return;
    }

    setPendingStatus(newStatusUI);
  };

  const handleConfirmUpdate = async () => {
    if (!user || !pendingStatus) return;
    try {
      setLoading(true);
      const apiValue = STATUS_API[pendingStatus];
      await updateStatus({ report_id: reportId, status: apiValue }, user.token);
      setStatus(pendingStatus);
      onUpdated?.(pendingStatus);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      setAlertMessage("Error al actualizar el estado. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setPendingStatus(null);
    }
  };

  const selectClass =
    (status === "En revisión" && styles.statusEnRevision) ||
    (status === "Aprobado" && styles.statusAprobado) ||
    (status === "No aprobado" && styles.statusNoAprobado) ||
    (status === "En proceso" && styles.statusEnProceso) ||
    (status === "Completado" && styles.statusCompletado) ||
    (status === "Cerrado" && styles.statusCierreTecnico) ||
    styles.default;

  return (
    <>
      <div className="d-inline-block">
        <div className="selectWrapper">
          <select
            value={status}
            disabled={loading}
            onChange={(e) => handleChange(e.target.value)}
            className={`form-select fw-bold rounded-pill px-3 py-1 text-white noArrow ${selectClass} ${styles.stateSelect}`}
          >
            {UI_STATUS.map((label) => {
              const apiCode = STATUS_API[label];
              const allowed = user ? PERMISSION_REQUIRED[user.role] : undefined;
              const isDisabled = allowed ? !allowed.includes(apiCode) : true;
              return (
                <option key={label} value={label} disabled={isDisabled}>
                  {label}
                </option>
              );
            })}
          </select>
          <i className="bi bi-chevron-down selectIcon"></i>
        </div>
      </div>

      {pendingStatus && (
        <ConfirmUpdate
          messageTitle="¿Está seguro de actualizar el estado?"
          message={`El reporte cambiará al estado "${pendingStatus}".`}
          onConfirm={handleConfirmUpdate}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {alertMessage && (
        <Alert
          messageTitle="Aviso"
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}
    </>
  );
}
