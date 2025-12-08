import { ReportStatistics } from "@/utils/types"; // Asume esta ruta para las interfaces

/**
 * Obtiene las estadísticas de los reportes.
 * @returns Una promesa que resuelve con los datos de las estadísticas.
 */
export async function getReportsStatistics(token: string): Promise<ReportStatistics> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/statistics`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let responseData: any;
    
    // **1. Leer el cuerpo de la respuesta una sola vez (éxito o error)**
    try {
        responseData = await response.json();
    } catch (e) {
        // Si falla la conversión a JSON (ej. si el error es HTML/texto puro), 
        // usamos un objeto vacío para el manejo de errores.
        responseData = {}; 
    }

    if (!response.ok) {
        // **2. Si la respuesta NO es OK, lanzamos el error usando los datos leídos.**
        // responseData contendrá el objeto de error del backend, o un objeto vacío.
        throw new Error(responseData.error || "Failed to fetch report statistics");
    }

    // **3. Si la respuesta es OK, responseData ya contiene los datos correctos.**
    const data: ReportStatistics = responseData;
    return data;
}