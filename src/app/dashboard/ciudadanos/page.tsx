"use client";

import { useAuth } from "@/hooks/useAuth";
import { getCiudadanos } from "@/services/getCiudadanos";
import { getUserReports } from "@/services/getUserReports";
import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";
import UserReportsModal from "@/components/Modals/UserReportModal";
import { CiudadanosResponse, UserReportsResponse } from "@/utils/types";

export default function CiudadanosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CiudadanosResponse | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reports, setReports] = useState<UserReportsResponse | null>(null);

  // Fetch ciudadanos
  useEffect(() => {
    const fetchCiudadanos = async () => {
      if (!user?.token) {
        setError("No hay token de autenticación");
        setLoading(false);
        return;
      }

      try {
        const result = await getCiudadanos(user.token);
        const sortedItems = [...result.items].sort(
          (a, b) => a.account_id - b.account_id
        );
        setData({ ...result, items: sortedItems });
      } catch {
        setError("Error al obtener ciudadanos");
      }

      setLoading(false);
    };

    fetchCiudadanos();
  }, [user?.token]);

  const openReportsModal = async (userId: number) => {
    setSelectedUser(userId);
    setShowModal(true);
    setLoadingReports(true);

    try {
      const result = await getUserReports(user!.token, userId);
      setReports(result);
    } catch {
      setReports(null);
    }

    setLoadingReports(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setReports(null);
  };

  return (
    <ProtectedPage permission="ciudadanos">
      <div className="container-fluid py-4">
        <div className="bg-white rounded-4 shadow-sm p-4">
          <h4 className="fw-bold text-dark mb-4">Listado de ciudadanos</h4>

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
                    <th>Nombre completo</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {data?.items.map((c) => (
                    <tr key={c.account_id}>
                      <td>{c.account_id}</td>
                      <td>{`${c.name} ${c.first_surname} ${c.second_surname}`}</td>
                      <td>{c.registration_date}</td>

                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openReportsModal(c.account_id)}
                        >
                          Ver reportes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <UserReportsModal
        show={showModal}
        loading={loadingReports}
        reports={reports}
        onClose={closeModal}
      />
    </ProtectedPage>
  );
}
