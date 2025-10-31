"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function AnalisisPage() {
  return (
    <ProtectedPage permission="analisis">
      <h1>Vista de Análisis</h1>
    </ProtectedPage>
  );
}
