"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/hooks/useAuth";
import LoadingImage from "@/components/LoadingImage";
import { getAllCatalogues } from "@/services/getAllCatalogues";
import { useRouter } from "next/navigation";

interface Catalogue {
  catalogue_id: number;
  name: string;
  description: string;
  budget: number;
  report_id: number | null;
  report_status: string | null;
}

export default function AllCataloguesPage() {
  return (
    <ProtectedPage permission="conceptos">
      <CatalogueInner />
    </ProtectedPage>
  );
}

function CatalogueInner() {
  const { user } = useAuth();
  const router = useRouter();

  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user?.token) return;

    try {
      setLoading(true);
      setError(null);

      const data = await getAllCatalogues(user.token);
      setCatalogues(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error cargando catálogos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.token]);

  if (!user) return <LoadingImage />;

  return (
    <div className="container py-4">
      <div className="bg-white rounded-4 shadow-sm p-4">
        {loading ? (
          <LoadingImage />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Presupuesto</th>
                  <th>Reporte ID</th>
                  <th>Estatus</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {catalogues.length ? (
                  catalogues.map((c) => (
                    <tr key={c.catalogue_id}>
                      <td>{c.catalogue_id}</td>
                      <td className="fw-medium">{c.name}</td>
                      <td>{c.description}</td>
                      <td>${c.budget}</td>
                      <td>{c.report_id}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor:
                              c.report_status === "En revisión"
                                ? "#F59E0B"
                                : c.report_status === "Aprobado"
                                ? "#16A34A"
                                : c.report_status === "No aprobado"
                                ? "#DC2626"
                                : c.report_status === "En proceso"
                                ? "#ff7800"
                                : c.report_status === "Completado"
                                ? "#2563EB"
                                : c.report_status === "Cerrado"
                                ? "#9333EA"
                                : "#6B7280",
                            color: "#fff",
                          }}
                        >
                          {c.report_status || "N/A"}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#611232" }}
                          onClick={() =>
                            router.push(
                              `/dashboard/catalogo/conceptos?report_id=${c.report_id}`
                            )
                          }
                        >
                          <i className="bi bi-eye me-2"></i>
                          Ver conceptos
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No hay catálogos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
