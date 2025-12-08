import { NeighborhoodReportCount } from "@/utils/types"; 

/**
 * Obtiene el conteo de reportes agrupados por colonia (neighborhood).
 * @returns Una promesa que resuelve con un array de conteos por colonia.
 */
export async function getReportsCountByNeighborhood(token: string): Promise<NeighborhoodReportCount[]> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/count-by-neighborhood`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let responseData: any;
    
    // 1. Leer el cuerpo de la respuesta una sola vez (éxito o error)
    try {
        responseData = await response.json();
    } catch (e) {
        responseData = {}; 
    }

    // CORRECCIÓN: if (!response.ok)
    if (!response.ok) { 
        // 2. Si la respuesta NO es OK, lanzamos el error usando los datos leídos.
        // Línea 31
        throw new Error(responseData.error || "Failed to fetch neighborhood counts");
    }

    // 3. Si la respuesta es OK, responseData ya contiene los datos correctos.
    const data: NeighborhoodReportCount[] = responseData;
    return data;
}