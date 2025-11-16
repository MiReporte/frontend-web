"use client";

import styles from "@/components/Modals/AlertModal.module.css";

interface AlertProps {
  messageTitle?: string;
  message: string;
  onClose: () => void;
}

export function Alert({ messageTitle, message, onClose }: AlertProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.alertBox}>
        <strong>{messageTitle}</strong>
        <p>{message}</p>
        <button onClick={onClose} className={styles.closeBtn}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
