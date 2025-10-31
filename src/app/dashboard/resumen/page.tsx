"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function ResumenPage() {
  return (
    <ProtectedPage permission="resumen">
      <h1>Vista de Resumen</h1>
    </ProtectedPage>
  );
}
