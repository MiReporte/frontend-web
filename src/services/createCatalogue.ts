export interface CreateCatalogPayload {
  name: string;
  description: string;
  report_id: number;
}

export async function createCatalogue(
  data: CreateCatalogPayload,
  token: string
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalogue/create-catalogue`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      throw new Error("Error al crear catálogo");
    }

    return await res.json();
  } catch (err) {
    console.error("createCatalogue error:", err);
    throw err;
  }
}
