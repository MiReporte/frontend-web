"use client";

import { useEffect, useState } from "react";
import { getReports } from "@/services/getReports";
import type { ResponseReports } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";
import { reverseGeocode } from "@/utils/reverseGeocoding";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const addressCache = new Map<string, string>();

  const fetchReports = async (page: number) => {
    try {
      setLoading(true);
      const data = await getReports(page, limit);

      const concurrency = 2;
      const results: (ResponseReports & { address?: string })[] = [];

      for (let i = 0; i < data.items.length; i += concurrency) {
        const batch = data.items.slice(i, i + concurrency);

        const batchResults = await Promise.all(
          batch.map(async (report) => {
            const key = `${report.latitude},${report.longitude}`;

            if (addressCache.has(key)) {
              return { ...report, address: addressCache.get(key) };
            }

            try {
              const address = await reverseGeocode(
                report.latitude,
                report.longitude
              );
              addressCache.set(key, address);
              return { ...report, address };
            } catch {
              return { ...report, address: "Sin ubicación" };
            }
          })
        );

        results.push(...batchResults);
        await new Promise((r) => setTimeout(r, 100));
      }

      setReports(results);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  if (loading) return <LoadingImage />;
  if (error) return <p>Error: {error}</p>;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleSwitch = (status: string) => async () => {
    try {
      setLoading(true);
      const data = await getReports(1, limit, status);
      setReports(data.items);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage permission="reportes">
      <h2>Listado de reportes</h2>

      <div className={styles.filterContainer}>
        <span onClick={handleSwitch("")}>Todos los estados</span>
        <span onClick={handleSwitch("REVISION")}>En revisión</span>
        <span onClick={handleSwitch("APROBADO")}>Aprobado</span>
        <span onClick={handleSwitch("NO_APROBADO")}>No aprobado</span>
        <span onClick={handleSwitch("COMPLETADO")}>Completado</span>
        <span onClick={handleSwitch("CIERRE")}>Cierre técnico</span>
      </div>

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
          {reports.length > 0 ? (
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
                <td className={styles.cellReport}>{report.status}</td>
                <td className={styles.cellReport}>
                  <span className={styles.buttonVer}>
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
                  <span className={styles.buttonSupervisor}>
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
              <td colSpan={6}>No hay reportes disponibles</td>
            </tr>
          )}
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
        </tbody>
      </table>
    </ProtectedPage>
  );
}
