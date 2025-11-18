"use client";

import { useEffect, useRef, useState } from "react";
import { getReports } from "@/services/getReports";
import type { ResponseReports } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";
import { reverseGeocode } from "@/utils/reverseGeocoding";
import { NewStateSelector } from "@/components/NewStateSelector";
import { UpdateSupervisorModal } from "@/components/Modals/UpdateSupervisorModal";
import { ReportModal } from "@/components/Modals/ReportModal";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";
import EyeIcon from "@/assets/EyeOutline.svg";
import CatalogIcon from "@/assets/TextFile.svg";
import SupervisorIcon from "@/assets/Worker.svg";
import styles from "@/app/dashboard/reportes/reportesPage.module.css";

export default function ReportesPage() {
  const [reports, setReports] = useState<
    (ResponseReports & { address?: string })[]
  >([]);

  const [showUpdateSupervisorModal, setShowUpdateSupervisorModal] = useState<{
    reportId: number;
    supervisorId: number | null;
  } | null>(null);

  const [showReportModal, setShowReportModal] = useState<{
    reportId: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const addressCache = useRef(new Map<string, string>());

  const [currentStatus, setCurrentStatus] = useState("");

  const fetchReports = async (page: number, status = "") => {
    try {
      setLoading(true);
      const data = await getReports(page, limit, status);

      const concurrency = 2;
      const results: (ResponseReports & { address?: string })[] = [];

      for (let i = 0; i < data.items.length; i += concurrency) {
        const batch = data.items.slice(i, i + concurrency);

        const batchResults = await Promise.all(
          batch.map(async (report) => {
            const key = `${report.latitude},${report.longitude}`;

            if (addressCache.current.has(key)) {
              return {
                ...report,
                address: addressCache.current.get(key),
              };
            }

            try {
              const address = await reverseGeocode(
                report.latitude,
                report.longitude
              );

              addressCache.current.set(key, address);
              return { ...report, address };
            } catch {
              return { ...report, address: "Sin ubicación" };
            }
          })
        );

        results.push(...batchResults);

        await new Promise((r) => setTimeout(r, 80));
      }

      setReports(results);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Efecto principal
  // -----------------------------
  useEffect(() => {
    fetchReports(currentPage, currentStatus);
  }, [currentPage, currentStatus]);

  // -----------------------------
  // Handlers de paginación
  // -----------------------------
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  // -----------------------------
  // Handler de filtros
  // -----------------------------
  const handleSwitch = (status: string) => () => {
    setCurrentStatus(status);
    setCurrentPage(1);
  };

  // -----------------------------
  // Modales
  // -----------------------------
  const OpenModalSupervisor = (
    reportId: number,
    supervisorId: number | null
  ) => {
    setShowUpdateSupervisorModal({ reportId, supervisorId });
  };

  const CloseModalSupervisor = () => {
    setShowUpdateSupervisorModal(null);
  };

  const OpenModalReport = (reportId: number) => {
    setShowReportModal({ reportId });
  };

  const CloseModalReport = () => {
    setShowReportModal(null);
  };

  return (
    <ProtectedPage permission="reportes">
      <h2>Listado de reportes</h2>

      {/* ---------------- Filter Switch ---------------- */}
      <div className={styles.filterContainer}>
        <span
          className={currentStatus === "" ? styles.activeFilter : ""}
          onClick={handleSwitch("")}
        >
          Todos los estados
        </span>

        <span
          className={currentStatus === "REVISION" ? styles.activeFilter : ""}
          onClick={handleSwitch("REVISION")}
        >
          En revisión
        </span>

        <span
          className={currentStatus === "APROBADO" ? styles.activeFilter : ""}
          onClick={handleSwitch("APROBADO")}
        >
          Aprobado
        </span>

        <span
          className={currentStatus === "NO_APROBADO" ? styles.activeFilter : ""}
          onClick={handleSwitch("NO_APROBADO")}
        >
          No aprobado
        </span>

        <span
          className={currentStatus === "COMPLETADO" ? styles.activeFilter : ""}
          onClick={handleSwitch("COMPLETADO")}
        >
          Completado
        </span>

        <span
          className={currentStatus === "CIERRE" ? styles.activeFilter : ""}
          onClick={handleSwitch("CIERRE")}
        >
          Cierre técnico
        </span>
      </div>

      {/* ---------------- Table ---------------- */}
      <table className={styles.reportTable}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableCell}>ID</th>
            <th className={styles.tableCell}>Tipo</th>
            <th className={styles.tableCell}>Ubicación</th>
            <th className={styles.tableCell}>Fecha</th>
            <th className={styles.tableCell}>Estado</th>
            <th className={styles.tableCell}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className={styles.loadingCell}>
                <LoadingImage />
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className={styles.errorCell}>
                Error: {error}
              </td>
            </tr>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <tr key={report.report_id}>
                <td className={styles.cellReport}>{report.report_id}</td>
                <td className={styles.cellReport}>{report.typereport}</td>

                <td className={styles.cellReport}>
                  {report.address
                    ? `${report.address.slice(0, 24)}...`
                    : "Cargando..."}
                </td>

                <td className={styles.cellReport}>{report.date}</td>

                <td className={styles.cellReport}>
                  <NewStateSelector
                    reportId={report.report_id}
                    currentStatus={report.status}
                  />
                </td>

                <td className={styles.cellReport}>
                  <span
                    className={styles.buttonVer}
                    onClick={() => OpenModalReport(report.report_id)}
                  >
                    <Image src={EyeIcon} alt="Ver" width={16} height={16} /> Ver
                  </span>

                  <span className={styles.buttonCatalogo}>
                    <Image
                      src={CatalogIcon}
                      alt="Catalogo"
                      width={16}
                      height={16}
                    />
                    Catalogo
                  </span>

                  <span
                    className={styles.buttonSupervisor}
                    onClick={() =>
                      OpenModalSupervisor(
                        report.report_id,
                        report.assigned_supervisor
                      )
                    }
                  >
                    <Image
                      src={SupervisorIcon}
                      alt="Supervisor"
                      width={16}
                      height={16}
                    />
                    Supervisor
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>
                No hay reportes disponibles
              </td>
            </tr>
          )}

          {!loading && (
            <tr>
              <td colSpan={6} className={styles.paginationContainer}>
                <div className={styles.paginationContent}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    Anterior
                  </button>

                  <span>
                    Página {currentPage} de {totalPages}
                  </span>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    Siguiente
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------------- Modals ---------------- */}
      {showUpdateSupervisorModal && (
        <UpdateSupervisorModal
          reportId={showUpdateSupervisorModal.reportId}
          supervisorId={showUpdateSupervisorModal.supervisorId}
          onClose={CloseModalSupervisor}
        />
      )}

      {showReportModal && (
        <ReportModal
          reportId={showReportModal.reportId}
          onClose={CloseModalReport}
        />
      )}
    </ProtectedPage>
  );
}
