"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function ProfilePage() {
  return (
    <ProtectedPage permission="perfil">
      <h1>Mi Perfil</h1>
    </ProtectedPage>
  );
}
