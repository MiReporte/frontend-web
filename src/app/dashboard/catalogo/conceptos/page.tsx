"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";

import { getCatalogueByReport } from "@/services/getCatalogueByReport";
import { getCatalogueConcepts } from "@/services/getCatalogueConcepts";

import CreateConceptModal from "@/components/Modals/AddConceptModal";

interface Concept {
  concept_id: number;
  code: string;
  category: string;
  description: string;
  unit: string;
  unit_price: number;
  quantity: number;
  amount: number;
}

interface CatalogueInfo {
  catalogue_id: number;
  name: string;
  description: string;
  budget: number;
  report_id: number;
  created_at: string;
}

export default function ConceptosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("report_id");

  const [catalogueInfo, setCatalogueInfo] = useState<CatalogueInfo | null>(
    null
  );
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = useCallback(async () => {
    if (!reportId || !user?.token) return;

    try {
      setLoading(true);
      setError(null);

      const catalogueData = await getCatalogueByReport(
        Number(reportId),
        user.token
      );
      setCatalogueInfo(catalogueData);

      const conceptsData = await getCatalogueConcepts(
        Number(catalogueData.catalogue_id),
        user.token
      );
      console.log("Concepts:", conceptsData);

      setConcepts(conceptsData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [reportId, user?.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProtectedPage permission="reportes">
      <div className="container-fluid py-4">
        {/* HEADER */}
        <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
          {loading ? (
            <LoadingImage />
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : catalogueInfo ? (
            <>
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="fw-bold">{catalogueInfo.name}</h4>
                  <p className="text-secondary">{catalogueInfo.description}</p>
                  <small className="text-muted">
                    Reporte No. {catalogueInfo.report_id}
                  </small>
                </div>

                <button
                  onClick={() => router.push("/dashboard/reportes")}
                  className="btn btn-outline-secondary btn-sm h-25"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Regresar
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-4 shadow-sm p-4">
          <div className="d-flex justify-content-between mb-4">
            <h5 className="fw-bold">Conceptos del catálogo</h5>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-sm text-white"
              style={{ backgroundColor: "#611232" }}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Agregar concepto
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="text-center">Unidad</th>
                  <th className="text-end">P. Unit</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center">
                      <LoadingImage />
                    </td>
                  </tr>
                ) : concepts.length ? (
                  concepts.map((c) => (
                    <tr key={`${c.code}-${c.description}-${c.unit}`}>
                      <td>{c.code}</td>
                      <td>{c.category}</td>
                      <td>{c.description}</td>
                      <td className="text-center">{c.unit}</td>
                      <td className="text-end">${c.unit_price}</td>
                      <td className="text-center">{c.quantity}</td>
                      <td className="text-end">${c.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      No hay conceptos en este catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL DE CREAR */}
        {showAddModal && (
          <CreateConceptModal
            catalogueId={Number(catalogueInfo?.catalogue_id)}
            onClose={() => setShowAddModal(false)}
            onCreated={() => {
              fetchData();
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </ProtectedPage>
  );
}
