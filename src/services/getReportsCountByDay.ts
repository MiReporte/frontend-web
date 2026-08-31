// services/getReportsCountByDay.ts
import { ReportCountByDay } from "@/utils/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const EMPTY: ReportCountByDay = {
  domingo: 0,
  lunes: 0,
  martes: 0,
  miercoles: 0,
  jueves: 0,
  viernes: 0,
  sabado: 0,
};

const DAY_ALIASES: Record<string, keyof ReportCountByDay> = {
  lunes: "lunes",
  lun: "lunes",
  monday: "lunes",
  martes: "martes",
  mar: "martes",
  tuesday: "martes",
  miercoles: "miercoles",
  "miércoles": "miercoles",
  mier: "miercoles",
  "mié": "miercoles",
  wednesday: "miercoles",
  jueves: "jueves",
  jue: "jueves",
  thursday: "jueves",
  viernes: "viernes",
  vie: "viernes",
  friday: "viernes",
  sabado: "sabado",
  "sábado": "sabado",
  sab: "sabado",
  "sáb": "sabado",
  saturday: "sabado",
  domingo: "domingo",
  dom: "domingo",
  sunday: "domingo",
  "0": "lunes",
  "1": "martes",
  "2": "miercoles",
  "3": "jueves",
  "4": "viernes",
  "5": "sabado",
  "6": "domingo",
};

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalize(data: unknown): ReportCountByDay {
  const result: ReportCountByDay = { ...EMPTY };

  if (!data || typeof data !== "object") return result;

  const root = data as Record<string, unknown>;

  const source: Record<string, unknown> = Array.isArray(root)
    ? root[0] && typeof root[0] === "object"
      ? (root[0] as Record<string, unknown>)
      : {}
    : root.data && typeof root.data === "object"
    ? (root.data as Record<string, unknown>)
    : root;

  for (const [key, value] of Object.entries(source)) {
    const alias = DAY_ALIASES[String(key).toLowerCase().trim()];
    if (alias) {
      result[alias] = toNumber(value);
    }
  }

  return result;
}

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
  const queryParams: string[] = [];

  if (typeFilter) {
    queryParams.push(`type=${typeFilter}`);
  }

  const url = `${API_URL}/reports/count-by-day${
    queryParams.length > 0 ? `?${queryParams.join("&")}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let responseData: unknown;
  try {
    responseData = await response.json();
  } catch {
    responseData = {};
  }

  if (!response.ok) {
    const errObj = responseData as { error?: string; msg?: string } | undefined;
    throw new Error(
      errObj?.error ||
        errObj?.msg ||
        "No se pudieron obtener los reportes por día"
    );
  }

  return normalize(responseData);
}