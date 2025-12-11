import { ReportStatistics, TimeRangeFilter } from "@/utils/types";
/**
 * Obtiene las estadísticas de los reportes.
 * @param token Token de autenticación.
 * @param typeFilter Filtro opcional por tipo de reporte ('BACHE' | 'ALUM' | null).
 * @param timeRangeFilter Filtro opcional por rango de tiempo (TimeRangeFilter | null).
 * @returns Una promesa que resuelve con los datos de las estadísticas.
 */
export async function getReportsStatistics(
  token: string,
  typeFilter: "BACHE" | "ALUM" | null = null,
  timeRangeFilter: TimeRangeFilter | null = null // ************ CAMBIO AÑADIDO ************
): Promise<ReportStatistics> {
  // Construir la URL base
  let url = `${process.env.NEXT_PUBLIC_API_URL}/reports/statistics`;

  // Crear un array para manejar los parámetros de query
  const queryParams: string[] = [];

  // Añadir el parámetro de tipo si está presente
  if (typeFilter) {
    queryParams.push(`type=${typeFilter}`);
  }

  // ************ INICIO DE CAMBIOS ************
  // Añadir el parámetro de rango de tiempo si está presente
  if (timeRangeFilter) {
    queryParams.push(`time_range=${timeRangeFilter}`);
  }
  // ************ FIN DE CAMBIOS ************

  // Adjuntar los parámetros a la URL si existen
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let responseData: any;
  try {
    responseData = await response.json();
  } catch (e) {
    responseData = {};
  }

  if (!response.ok) {
    throw new Error(responseData.error || "Failed to fetch report statistics");
  }

  const data: ReportStatistics = responseData;
  return data;
}
