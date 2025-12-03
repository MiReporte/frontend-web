export interface CatalogueItem {
  catalogue_id: number;
  name: string;
  description: string;
  budget: number;
  report_id: number | null;
  report_status: string | null;
}

export async function getAllCatalogues(
  token: string
): Promise<CatalogueItem[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalogue/get-all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Token inválido o faltante.");
      }
      if (res.status === 403) {
        throw new Error("Permiso denegado.");
      }
      throw new Error(`Error al obtener catálogos (${res.status})`);
    }

    const data = await res.json();
    return data as CatalogueItem[];
  } catch (error) {
    console.error("Error en getAllCatalogues:", error);
    throw error;
  }
}
