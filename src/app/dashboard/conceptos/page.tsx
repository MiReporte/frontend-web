"use client";

import ProtectedPage from "@/components/ProtectedPage";
import { useAuth } from "@/hooks/useAuth";
import LoadingImage from "@/components/LoadingImage";

export default function ConceptosPage() {
  return (
    <ProtectedPage permission="conceptos">
      <ProfileInner />
    </ProtectedPage>
  );
}

function ProfileInner() {
  const { user } = useAuth();

  if (!user) {
    return <LoadingImage />;
  }

  return (
    <ProtectedPage permission="perfil">
      <div className="container py-4">
        <div className="card shadow-sm border-0 rounded-4 p-4">
          <div className="d-flex align-items-center gap-3 mb-4"></div>
        </div>
      </div>
    </ProtectedPage>
  );
}
