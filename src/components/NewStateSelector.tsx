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
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = (newStatusUI: string) => {
    if (!user) return;

    if (!PERMISSION_REQUIRED[user.role]?.includes(STATUS_API[newStatusUI])) {
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

  const handleCancelUpdate = () => setPendingStatus(null);
  const handleCloseAlert = () => setAlertMessage(null);

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
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className={`${selectClass} ${styles.select}`}
      >
        {UI_STATUS.map((label) => (
          <option key={label} value={label} className={styles.option}>
            {label}
          </option>
        ))}
      </select>

      {pendingStatus && (
        <ConfirmUpdate
          messageTitle={"¿Está seguro de actualizar el estado?"}
          message={`El reporte cambiara al estado "${pendingStatus}".`}
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
        />
      )}

      {alertMessage && (
        <Alert
          messageTitle="Lo sentimos"
          message={alertMessage}
          onClose={handleCloseAlert}
        />
      )}
    </>
  );
}
