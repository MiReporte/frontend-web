"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getStaff } from "@/services/getStaff";
import { AccountItem } from "@/utils/types";
import { EditStaffModal } from "@/components/Modals/EditStaffModal";
import { DeleteStaffModal } from "@/components/Modals/DeleteStaffModal";
import { AddStaffModal } from "@/components/Modals/AddStaffModal";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";

export default function UsuariosPage() {
  return (
    <ProtectedPage permission="conceptos">
      <ProfileInner />
    </ProtectedPage>
  );
}

function ProfileInner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<AccountItem[]>([]);
  const [editingStaff, setEditingStaff] = useState<AccountItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const handleEdit = (member: AccountItem) => {
    setEditingStaff(member);
  };

  const handleDelete = (member: AccountItem) => {
    setDeleteId(member.account_id);
  };

  const reloadStaff = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getStaff(user.token);

      const combined = [
        ...(data.mesa_servicios ?? []),
        ...(data.supervisors ?? []),
      ];

      const activeStaff = combined.filter(
        (item) => item.account_status === "ACTIVE"
      );

      setStaff(activeStaff);
    } catch (err) {
      console.error("Error reloading staff:", err);
      setError("Error al recargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadStaff();
  }, [user]);

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0 rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Gestión de Usuarios</h4>
          <button
            className="btn btn-primary px-4"
            onClick={() => setShowAdd(true)}
          >
            Agregar Usuario
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead
              className="border-light sticky-top bg-white"
              style={{ zIndex: 1, top: 0 }}
            >
              <tr>
                <th className="text-secondary small ps-3 bg-white">ID</th>
                <th className="text-secondary small bg-white">Nombre</th>
                <th className="text-secondary small bg-white">Correo</th>
                <th className="text-secondary small bg-white">Rol</th>
                <th className="text-secondary small bg-white text-center">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <LoadingImage />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-danger">
                    {error}
                  </td>
                </tr>
              ) : staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.account_id}>
                    <td className="ps-3">{member.account_id}</td>
                    <td>
                      {member.name} {member.first_surname}{" "}
                      {member.second_surname}
                    </td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center"
                          onClick={() => handleEdit(member)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill d-flex align-items-center"
                          onClick={() => handleDelete(member)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    No hay usuarios disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingStaff && (
        <EditStaffModal
          staffId={editingStaff.account_id}
          existingData={editingStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}

      {deleteId !== null && (
        <DeleteStaffModal
          userId={deleteId}
          onClose={async () => {
            setDeleteId(null);
            await reloadStaff();
          }}
        />
      )}

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onAdded={async () => {
            await reloadStaff();
          }}
        />
      )}
    </div>
  );
}
