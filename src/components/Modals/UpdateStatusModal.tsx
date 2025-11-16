"use client";

import styles from "@/components/Modals/UpdateStatusModal.module.css";

interface ConfirmUpdateProps {
  messageTitle?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmUpdate({
  messageTitle,
  message,
  onConfirm,
  onCancel,
}: ConfirmUpdateProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.confirmBox}>
        <strong>{messageTitle}</strong>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Cancelar
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
