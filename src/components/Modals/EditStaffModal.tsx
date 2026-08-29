"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { editStaff } from "@/services/editStaff";
import { EditStaffBody, AccountItem } from "@/utils/types";

interface EditStaffModalProps {
  staffId: number;
  onClose: () => void;
  existingData?: AccountItem;
  onUpdated: () => Promise<void> | void;
}

export function EditStaffModal({
  staffId,
  onClose,
  existingData,
  onUpdated,
}: EditStaffModalProps) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [firstSurname, setFirstSurname] = useState<string>("");
  const [secondSurname, setSecondSurname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("");

  const ROLE_TO_CODE: Record<string, string> = {
    "Supervisor tecnico": "SUP",
    "Mesa de servicios": "MESA",
    SUP: "SUP",
    MESA: "MESA",
  };

  useEffect(() => {
    if (!existingData) {
      setLoading(false);
      return;
    }

    setName(existingData.name ?? "");
    setFirstSurname(existingData.first_surname ?? "");
    setSecondSurname(existingData.second_surname ?? "");
    setEmail(existingData.email ?? "");
    setRole(ROLE_TO_CODE[existingData.role] ?? "");

    setLoading(false);
  }, [existingData]);

  const handleSave = async () => {
    if (!user) return;

    setError(null);

    if (!name.trim() || !firstSurname.trim() || !email.trim() || !role.trim()) {
      setError("Los campos obligatorios deben estar llenos.");
      return;
    }

    try {
      setSaving(true);

      const body: EditStaffBody = {
        name,
        first_surname: firstSurname,
        second_surname: secondSurname,
        email,
        role,
      };

      await editStaff(user.token, staffId, body);

      await onUpdated();

      setSuccess("Usuario actualizado correctamente.");

      setTimeout(() => onClose(), 800);
    } catch (error: unknown) {
      console.error(error);
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el usuario."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={(e) =>
        e.target === e.currentTarget && !saving ? onClose() : null
      }
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow rounded-4">
          {/* HEADER */}
          <div className="modal-header border-0">
            <h5 className="modal-title fw-bold" style={{ color: "#611232" }}>
              Editar Usuario
            </h5>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {loading ? (
              <p className="text-center py-3">Cargando...</p>
            ) : (
              <>
                {error && (
                  <div className="alert alert-danger py-2">{error}</div>
                )}
                {success && (
                  <div className="alert alert-success py-2">{success}</div>
                )}

                {/* Nombre */}
                <div className="mb-3">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    disabled={saving}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Primer apellido */}
                <div className="mb-3">
                  <label className="form-label">Primer Apellido *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstSurname}
                    disabled={saving}
                    onChange={(e) => setFirstSurname(e.target.value)}
                  />
                </div>

                {/* Segundo apellido */}
                <div className="mb-3">
                  <label className="form-label">Segundo Apellido</label>
                  <input
                    type="text"
                    className="form-control"
                    value={secondSurname}
                    disabled={saving}
                    onChange={(e) => setSecondSurname(e.target.value)}
                  />
                </div>

                {/* Correo */}
                <div className="mb-3">
                  <label className="form-label">Correo *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    disabled={saving}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Rol */}
                <div className="mb-3">
                  <label className="form-label">Rol *</label>
                  <select
                    className="form-select"
                    value={role}
                    disabled={saving}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Seleccione un rol</option>
                    <option value="SUP">Supervisor Técnico</option>
                    <option value="MESA">Mesa de Servicios</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0">
            <button
              className="btn btn-outline-secondary rounded-pill px-5 fw-medium"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              className="btn text-white rounded-pill px-5 fw-medium"
              style={{ backgroundColor: "#611232" }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving && (
                <span className="spinner-border spinner-border-sm me-2"></span>
              )}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
