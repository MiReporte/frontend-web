"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function ConceptosPage() {
  return (
    <ProtectedPage permission="conceptos">
      <h1>Vista de Conceptos</h1>
    </ProtectedPage>
  );
}
