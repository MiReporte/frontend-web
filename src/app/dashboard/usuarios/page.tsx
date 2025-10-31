"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function UsuariosPage() {
  return (
    <ProtectedPage permission="usuarios">
      <h1>Vista de Usuarios</h1>
    </ProtectedPage>
  );
}
