import { NeighborhoodReportCount, TimeRangeFilter } from "@/utils/types";
/**
 * Obtiene el conteo de reportes agrupados por colonia (neighborhood),
 * opcionalmente filtrado por tipo de reporte y rango de tiempo.
 * @param token Token de autenticación.
 * @param typeFilter Filtro opcional por tipo de reporte ('BACHE' | 'ALUM' | null).
 * @param timeRangeFilter Filtro opcional por rango de tiempo (TimeRangeFilter | null).
 * @returns Una promesa que resuelve con un array de conteos por colonia.
 */
export async function getReportsCountByNeighborhood(
  token: string,
  typeFilter: "BACHE" | "ALUM" | null = null,
  timeRangeFilter: TimeRangeFilter | null = null // ************ CAMBIO AÑADIDO ************
): Promise<NeighborhoodReportCount[]> {
  // Construcción de la URL base
  let url = `${process.env.NEXT_PUBLIC_API_URL}/reports/count-by-neighborhood`;

  // Crear un array para manejar los parámetros de query
  const queryParams: string[] = [];

  // Si hay filtro de tipo, lo agregamos como query parameter
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

  const response = await fetch(
    url, // Usamos la URL con o sin los filtros
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  let responseData: unknown;
  // 1. Leer el cuerpo de la respuesta una sola vez (éxito o error)
  try {
    responseData = await response.json();
  } catch {
    responseData = {};
  }

  // 2. Manejo de error
  if (!response.ok) {
    const errObj = responseData as { error?: string } | undefined;
    throw new Error(
      errObj?.error || "Failed to fetch neighborhood counts"
    );
  }

  // 3. Retorno de datos
  const data = (responseData || []) as NeighborhoodReportCount[];
  return data;
}
