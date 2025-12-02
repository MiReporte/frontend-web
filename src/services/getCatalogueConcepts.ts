export async function getCatalogueConcepts(catalogueId: number, token: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/catalogue/get-concepts/${catalogueId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.status === 404) {
      throw new Error("El catálogo no existe");
    }

    if (!res.ok) {
      throw new Error("Error al obtener conceptos");
    }

    return await res.json();
  } catch (err) {
    console.error("getCatalogueConcepts error:", err);
    throw err;
  }
}
