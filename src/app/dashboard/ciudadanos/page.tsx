"use client";

import { useAuth } from "@/hooks/useAuth";
import { getCiudadanos } from "@/services/getCiudadanos";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";
import { CiudadanoItem, CiudadanosResponse } from "@/utils/types";

export default function CiudadanosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CiudadanosResponse | null>(null);

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

  const handleViewReports = (citizen: CiudadanoItem) => {
    const fullName = `${citizen.name} ${citizen.first_surname}`.trim();
    router.push(
      `/dashboard/reportes?user_id=${citizen.account_id}&user_name=${encodeURIComponent(fullName)}`
    );
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
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
                          onClick={() => handleViewReports(c)}
                          title={`Ver reportes de ${c.name} ${c.first_surname}`}
                        >
                          <i className="bi bi-file-earmark-text"></i>
                          <span>Ver reportes</span>
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
    </ProtectedPage>
  );
}
