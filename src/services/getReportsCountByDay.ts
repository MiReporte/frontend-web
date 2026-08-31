// services/getReportsCountByDay.ts
//import axios from 'axios';
import { ReportCountByDay } from "@/utils/types"; // Asumiendo que types.ts está en utils/types

const API_URL = process.env.NEXT_PUBLIC_API_URL; // Asegúrate de tener tu variable de entorno configurada

/**
 * Obtiene el conteo de reportes por día de la semana actual.
 *
 * @param token Token de autenticación del usuario.
 * @param typeFilter Tipo de reporte a filtrar ('BACHE', 'ALUM' o null para todos).
 * @returns Un objeto con el conteo de reportes para cada día de la semana.
 */
export async function getReportsCountByDay(
  token: string,
  typeFilter: "BACHE" | "ALUM" | null
): Promise<ReportCountByDay> {
  let url = `${API_URL}/reports/count-by-day`;
  if (typeFilter) {
    url += `?type=${encodeURIComponent(typeFilter)}`;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as ReportCountByDay;
    return data;
  } catch (error) {
    console.error("Error fetching reports count by day:", error);
    // Devuelve una estructura vacía en caso de error para evitar fallos
    return {
      domingo: 0,
      lunes: 0,
      martes: 0,
      miercoles: 0,
      jueves: 0,
      viernes: 0,
      sabado: 0,
    };
  }
}
