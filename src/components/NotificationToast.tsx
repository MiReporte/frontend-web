"use client";

import React from "react";
import Link from "next/link";
import { NewReportSocketPayload } from "@/utils/types";

interface NotificationToastProps {
  toast: {
    id: string;
    payload: NewReportSocketPayload;
  } | null;
  onClose: () => void;
}

export function NotificationToast({ toast, onClose }: NotificationToastProps) {
  if (!toast) return null;

  const { notification, report } = toast.payload;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1100 }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="toast show shadow-lg border-0 bg-white"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ minWidth: "320px", borderRadius: "12px", overflow: "hidden" }}
      >
        <div
          className="toast-header text-white"
          style={{ backgroundColor: "#611232" }}
        >
          <i className="bi bi-bell-fill me-2 fs-6"></i>
          <strong className="me-auto">Nuevo Reporte Recibido</strong>
          <small className="text-white-50">Ahora mismo</small>
          <button
            type="button"
            className="btn-close btn-close-white"
            aria-label="Cerrar"
            onClick={onClose}
          ></button>
        </div>
        <div className="toast-body p-3 bg-light">
          <p className="mb-2 fw-medium text-dark">{notification.message}</p>
          <div className="d-flex justify-content-between align-items-center small text-secondary mb-2">
            <span>
              Tipo: <strong>{report.typereport}</strong>
            </span>
            <span>
              Estado: <strong>{report.status}</strong>
            </span>
          </div>
          <div className="d-flex justify-content-end mt-2">
            <Link
              href={`/dashboard/reportes?report_id=${report.report_id}`}
              className="btn btn-sm text-white px-3 fw-medium"
              style={{ backgroundColor: "#611232" }}
              onClick={onClose}
            >
              Ver Reporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
