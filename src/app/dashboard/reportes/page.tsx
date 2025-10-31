"use client";

import ProtectedPage from "@/components/ProtectedPage";

export default function ReportesPage() {
  return (
    <ProtectedPage permission="reportes">
      <h1>Vista de Reportes</h1>
    </ProtectedPage>
  );
}
