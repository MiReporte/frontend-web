"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addStaff } from "@/services/addStaff";
import type { NewStaffBody } from "@/utils/types";

interface AddStaffModalProps {
  onClose: () => void;
  onAdded: () => void;
}

export function AddStaffModal({ onClose, onAdded }: AddStaffModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NewStaffBody>({
    name: "",
    first_surname: "",
    second_surname: "",
    email: "",
    password: "",
    role: "SUP",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    try {
      if (!user?.token) {
        setError("No hay token de autenticación");
        return;
      }

      setLoading(true);
      setError(null);
      console.log("BODY A ENVIAR:", form);

      await addStaff(user.token, form);

      setLoading(false);
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("No se pudo agregar el usuario.");
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Agregar Usuario
            </h5>
          </div>

          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Nombre(s)</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Primer Apellido</label>
              <input
                type="text"
                name="first_surname"
                className="form-control"
                value={form.first_surname}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Segundo Apellido</label>
              <input
                type="text"
                name="second_surname"
                className="form-control"
                value={form.second_surname}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Correo</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Rol</label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                <option value="SUP">Supervisor Técnico</option>
                <option value="MESA">Mesa de Servicios</option>
              </select>
            </div>

            {error && (
              <p className="text-danger text-center fw-semibold">{error}</p>
            )}
          </div>

          <div className="modal-footer border-0 justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              disabled={loading}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn text-white rounded-pill px-5 fw-medium"
              style={{ backgroundColor: "#611232" }}
              disabled={loading}
              onClick={handleAdd}
            >
              {loading ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
