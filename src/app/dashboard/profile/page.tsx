"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import ProtectedPage from "@/components/ProtectedPage";
import LoadingImage from "@/components/LoadingImage";

export default function ProfilePage() {
  return (
    <ProtectedPage permission="perfil">
      <ProfileInner />
    </ProtectedPage>
  );
}

function ProfileInner() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingImage />;
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <ProtectedPage permission="perfil">
      <div className="container py-4">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            {user.image == null ? (
              <div
                className="rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#61123215",
                  color: "#611232",
                  fontSize: "2rem",
                  fontWeight: "600",
                }}
              >
                {initial}
              </div>
            ) : (
              <div
                className="rounded-circle overflow-hidden shadow-sm"
                style={{ width: "70px", height: "70px" }}
              >
                <Image
                  src={user.image}
                  alt={`${user.name} ${user.first_surname}`}
                  width={70}
                  height={70}
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}

            <div>
              <h4 className="mb-1 fw-bold text-dark">
                {user.name} {user.first_surname}
              </h4>
              <p className="text-muted mb-0">{user.email}</p>
            </div>
          </div>

          <div className="mt-3">
            <div className="py-3 border-bottom">
              <p className="text-muted small mb-1">Nombre completo</p>
              <p className="fw-semibold mb-0">
                {user.name} {user.first_surname} {user.second_surname}
              </p>
            </div>

            <div className="py-3">
              <p className="text-muted small mb-1">Correo electrónico</p>
              <p className="fw-semibold mb-0">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
