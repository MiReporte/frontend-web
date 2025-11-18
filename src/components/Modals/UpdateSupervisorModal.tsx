"use client";

import { useEffect, useState } from "react";
import type { SupervisorsResponse } from "@/utils/types";
import { getSupervisors } from "@/services/getSupervisors";
import { useAuth } from "@/hooks/useAuth";
import { updateSupervisorReport } from "@/services/updateSupervisorReport";
import Image from "next/image";
import Profile from "@/assets/ProfileActive.svg";
import styles from "@/components/Modals/UpdateSupervisorModal.module.css";

interface UpdateSupervisorProps {
  reportId: number;
  supervisorId: number | null;
  onClose: () => void;
}

export function UpdateSupervisorModal({
  reportId,
  supervisorId,
  onClose,
}: UpdateSupervisorProps) {
  const { user } = useAuth();
  const [supervisors, setSupervisors] = useState<SupervisorsResponse[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState<number | null>(
    supervisorId
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupervisors = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const data = await getSupervisors(user.token);
        setSupervisors(data);
        setLoading(false);
      } catch (err) {
        setError(`Error al cargar supervisores: ${err}`);
        setLoading(false);
      }
    };

    fetchSupervisors();
  }, [user]);

  const updateSupervisor = async () => {
    if (!user || selectedSupervisor === null) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await updateSupervisorReport(
        { report_id: reportId, assigned_supervisor: selectedSupervisor },
        user.token
      );

      setSuccessMessage("Supervisor actualizado correctamente.");
      setSaving(false);

      setTimeout(() => onClose(), 900);
    } catch (err) {
      setError("No se pudo actualizar el supervisor.");
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Asignar Supervisor Técnico</h2>

        {loading ? (
          <p>Cargando supervisores...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <div className={styles.content}>
              <div className={styles.supActual}>
                <p>SUPERVISOR ACTUAL</p>

                {selectedSupervisor !== null ? (
                  <>
                    <p style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {
                        supervisors.find(
                          (sup) => sup.account_id === selectedSupervisor
                        )?.name
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <p>Sin asignar</p>
                    <p>
                      Este reporte no tiene un supervisor asignado actualmente
                    </p>
                  </>
                )}
              </div>

              <div className={styles.list}>
                {supervisors.map((sup) => (
                  <div
                    key={sup.account_id}
                    className={`${styles.item} ${
                      selectedSupervisor === sup.account_id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => setSelectedSupervisor(sup.account_id)}
                  >
                    <span className={styles.itemInfoContainer}>
                      {sup.image !== null ? (
                        <Image
                          src={sup.image}
                          alt="Profile Picture"
                          width={48}
                          height={48}
                          style={{ borderRadius: "100%" }}
                        />
                      ) : (
                        <Image
                          src={Profile}
                          alt="Default Profile Picture"
                          width={48}
                          height={48}
                          style={{ borderRadius: "100%" }}
                        />
                      )}
                      <span className={styles.itemInfo}>
                        <p>
                          {sup.name} {sup.first_surname} {sup.second_surname}
                        </p>
                        <p>Id supervisor: {sup.account_id}</p>
                      </span>
                    </span>
                    <div className={styles.itemReports}>
                      <p className={styles.itemReportsCount}>
                        {sup.counted_reports}
                      </p>
                      <p className={styles.itemReportsLabel}>Reportes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {successMessage && (
              <p className={styles.success}>{successMessage}</p>
            )}
            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancelar
              </button>

              <button
                className={styles.saveButton}
                onClick={updateSupervisor}
                disabled={saving || selectedSupervisor === null}
              >
                {saving ? "Asignando..." : "Asignar Supervisor"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
