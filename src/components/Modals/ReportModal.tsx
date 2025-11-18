"use client";

import { useEffect, useState } from "react";
import { getReportById } from "@/services/getReportById";
import { useAuth } from "@/hooks/useAuth";
import { GetReportByIdResponse } from "@/utils/types";
import { reverseGeocode } from "@/utils/reverseGeocoding";
import Image from "next/image";
import styles from "@/components/Modals/ReportModal.module.css";

interface ReportProps {
  reportId: number;
  onClose: () => void;
}

// Cache para no repetir geocoding
const addressCache = new Map<string, string>();

export function ReportModal({ reportId, onClose }: ReportProps) {
  const { user } = useAuth();

  const [reportData, setReportData] = useState<GetReportByIdResponse | null>(
    null
  );
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

      setLoading(true);

      const data = await getReportById(reportId, user.token);

      if (!data) {
        setError("No se pudo obtener la información del reporte");
        setLoading(false);
        return;
      }

      setReportData(data);

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

      setLoading(false);
    };

    run();
  }, [reportId, user?.token]);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Detalle del reporte</h3>

        {/* Loading */}
        {loading && <p>Cargando información...</p>}

        {/* Error */}
        {error && <p className={styles.errorText}>{error}</p>}

        {/* Contenido */}
        {!loading && !error && reportData && (
          <div className={styles.reportDetails}>
            <div className={styles.headerSection}>
              <span>
                <strong>Folio</strong>
                <p>{reportData.report_id}</p>
              </span>

              <span>
                <strong>Tipo</strong>
                <p>{reportData.asunto}</p>
              </span>

              <span>
                <strong>Estado</strong>
                <p>{reportData.status}</p>
              </span>
            </div>

            <div className={styles.addressSection}>
              <strong>Ubicación</strong>
              <p>{address}</p>
            </div>

            <div className={styles.dateSection}>
              <strong>Fecha</strong>
              <p>
                {new Date(reportData.date).toLocaleString("es-MX", {
                  dateStyle: "medium",
                })}
              </p>
            </div>

            <div className={styles.picSection}>
              <strong>Foto</strong>

              {reportData.evidence &&
              typeof reportData.evidence === "string" &&
              reportData.evidence.startsWith("http") ? (
                <Image
                  src={reportData.evidence}
                  alt="Foto del reporte"
                  width={200}
                  height={200}
                />
              ) : (
                <p>No hay foto disponible</p>
              )}
            </div>

            <div className={styles.descriptionSection}>
              <strong>Descripción</strong>
              <p>{reportData.description}</p>
            </div>
          </div>
        )}

        {/* Botón Salir */}
        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
