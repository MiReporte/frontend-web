export async function getCatalogueByReport(reportId: number, token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalogue/get-catalogue-info/${reportId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Error al obtener el catálogo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getCatalogueByReport:", error);
    return null;
  }
}
