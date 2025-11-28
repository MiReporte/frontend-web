"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { deleteStaff } from "@/services/deleteStaff";

interface DeleteStaffModalProps {
  userId: number;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteStaffModal({
  userId,
  onClose,
  onDeleted,
}: DeleteStaffModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.token) {
        throw new Error("No hay token de autenticación");
      }

      await deleteStaff(user.token, userId);

      setLoading(false);

      if (onDeleted) onDeleted();
      onClose();
    } catch (err) {
      setLoading(false);
      setError("No se pudo eliminar el usuario");
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
              Eliminar usuario
            </h5>
          </div>

          <div className="modal-body text-center">
            <p className="fs-5">¿Seguro que deseas eliminar este usuario?</p>

            {error && <p className="text-danger fw-semibold mt-2">{error}</p>}
          </div>

          <div className="modal-footer border-0 justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-secondary rounded-pill px-4"
              disabled={loading}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn text-white rounded-pill px-4"
              style={{ backgroundColor: "#611232" }}
              disabled={loading}
              onClick={handleDelete}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
