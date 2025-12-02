"use client";
import { useState } from "react";
import { createCatalogue } from "@/services/createCatalogue";
import { useAuth } from "@/hooks/useAuth";

interface CreateCatalogModalProps {
  reportId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCatalogModal({
  reportId,
  onClose,
  onCreated,
}: CreateCatalogModalProps) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const res = await createCatalogue(
        {
          name: form.name,
          description: form.description,
          report_id: Number(reportId),
        },
        user.token
      );

      setTimeout(() => {
        onCreated();
      }, 500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al crear el catálogo"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 2000 }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Crear Catálogo
            </h5>
          </div>

          <div className="modal-body px-4">
            {/* Nombre */}
            <label className="fw-semibold text-secondary">
              Nombre del catálogo <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control mb-3 rounded-3"
              required
              value={form.name}
              disabled={loading}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {/* Descripción */}
            <label className="fw-semibold text-secondary">Descripción</label>
            <textarea
              className="form-control mb-3 rounded-3"
              rows={3}
              disabled={loading}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {error && <p className="text-danger small mb-0 mt-2">{error}</p>}
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top-0 pt-0 justify-content-between px-4 pb-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="catalogueForm"
              className="btn text-white rounded-pill px-4 fw-medium shadow-sm"
              style={{ backgroundColor: "#611232", border: "none" }}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Crear Catálogo"}
            </button>
          </div>
        </div>
      </div>

      <form id="catalogueForm" onSubmit={handleSubmit}></form>
    </div>
  );
}
