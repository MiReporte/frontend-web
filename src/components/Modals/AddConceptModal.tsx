"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createConcept } from "@/services/createConcept";

interface Props {
  catalogueId: number;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateConceptModal({
  catalogueId,
  onClose,
  onCreated,
}: Props) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    catalogue_id: catalogueId,
    category: "",
    code: "",
    description: "",
    quantity: 1,
    unit: "",
    unit_price: 0,
  });

  const handleSubmit = async () => {
    try {
      if (!user) throw new Error("Usuario no autenticado");

      await createConcept(form, user.token);

      onCreated();
    } catch (error) {
      console.error("Error creando concepto:", error);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-bottom-0 pb-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Agregar Concepto
            </h5>
          </div>

          <div className="modal-body px-4">
            {/* Categoria */}
            <label className="fw-semibold text-secondary">Categoría</label>
            <input
              type="text"
              className="form-control mb-3 rounded-3"
              placeholder="Ejemplo: Materiales, Mano de Obra, etc."
              value={form.category}
              required
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            {/* Código */}
            <label className="fw-semibold text-secondary">Código</label>
            <input
              type="text"
              className="form-control mb-3 rounded-3"
              placeholder="Ejemplo: 001, A123, etc."
              value={form.code}
              required
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />

            {/* Descripción */}
            <label className="fw-semibold text-secondary">Descripción</label>
            <textarea
              className="form-control mb-3 rounded-3"
              placeholder="Descripción del concepto"
              rows={2}
              value={form.description}
              required
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            {/* Cantidad */}
            <label className="fw-semibold text-secondary">Cantidad</label>
            <input
              type="number"
              min={1}
              className="form-control mb-3 rounded-3"
              value={form.quantity}
              required
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) })
              }
            />

            {/* Unidad */}
            <label className="fw-semibold text-secondary">Unidad</label>
            <input
              type="text"
              className="form-control mb-3 rounded-3"
              placeholder="Ejemplo: m2, kg, hrs, pz"
              value={form.unit}
              required
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />

            {/* Precio unitario */}
            <label className="fw-semibold text-secondary">
              Precio Unitario
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control mb-3 rounded-3"
              value={form.unit_price}
              required
              onChange={(e) =>
                setForm({ ...form, unit_price: Number(e.target.value) })
              }
            />
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-top-0 pt-0 justify-content-between px-4 pb-4">
            <button
              type="button"
              className="btn text-secondary rounded-pill px-4 fw-medium"
              style={{ backgroundColor: "#e9ecef" }}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn text-white rounded-pill px-4 fw-medium shadow-sm"
              style={{ backgroundColor: "#611232", border: "none" }}
              onClick={handleSubmit}
            >
              Guardar Concepto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
