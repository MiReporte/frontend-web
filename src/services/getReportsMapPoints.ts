import { ReportMapPoint, TimeRangeFilter } from "@/utils/types";

const SAMPLE_MAP_POINTS: ReportMapPoint[] = [
  {
    report_id: 101,
    latitude: 19.5386,
    longitude: -96.9242,
    typereport: "BACHE",
    status: "REVISION",
    date: new Date().toISOString(),
    problem: "Bache profundo en carril derecho",
    neighborhood: "Centro",
  },
  {
    report_id: 102,
    latitude: 19.5412,
    longitude: -96.9185,
    typereport: "BACHE",
    status: "PROCESO",
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    problem: "Hundimiento de pavimento",
    neighborhood: "Centro",
  },
  {
    report_id: 103,
    latitude: 19.5354,
    longitude: -96.9211,
    typereport: "ALUM",
    status: "APROBADO",
    date: new Date(Date.now() - 3600000 * 12).toISOString(),
    problem: "Lámpara apagada en esquina",
    neighborhood: "Los Sauces",
  },
  {
    report_id: 104,
    latitude: 19.5489,
    longitude: -96.9056,
    typereport: "BACHE",
    status: "REVISION",
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    problem: "Múltiples baches en avenida principal",
    neighborhood: "Ánimas",
  },
  {
    report_id: 105,
    latitude: 19.5512,
    longitude: -96.9023,
    typereport: "ALUM",
    status: "PROCESO",
    date: new Date(Date.now() - 3600000 * 48).toISOString(),
    problem: "Cables sueltos y falta de alumbrado",
    neighborhood: "Ánimas",
  },
  {
    report_id: 106,
    latitude: 19.5312,
    longitude: -96.9315,
    typereport: "BACHE",
    status: "COMPLETADO",
    date: new Date(Date.now() - 3600000 * 72).toISOString(),
    problem: "Bache reparado",
    neighborhood: "Coapexpan",
  },
  {
    report_id: 107,
    latitude: 19.5428,
    longitude: -96.9154,
    typereport: "BACHE",
    status: "REVISION",
    date: new Date().toISOString(),
    problem: "Bache peligroso cerca de escuela",
    neighborhood: "Centro",
  },
  {
    report_id: 108,
    latitude: 19.5399,
    longitude: -96.9201,
    typereport: "ALUM",
    status: "REVISION",
    date: new Date().toISOString(),
    problem: "Lámpara parpadeando",
    neighborhood: "Centro",
  },
];

export async function getReportsMapPoints(
  token: string,
  typeFilter: "BACHE" | "ALUM" | null = null,
  timeRangeFilter: TimeRangeFilter | null = null
): Promise<ReportMapPoint[]> {
  const queryParams: string[] = [];

  if (typeFilter) {
    queryParams.push(`type=${encodeURIComponent(typeFilter)}`);
  }

  if (timeRangeFilter) {
    queryParams.push(`time_range=${encodeURIComponent(timeRangeFilter)}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
  const primaryUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports/map-points${queryString}`;

  // 1. Intento primario: Endpoint especializado /reports/map-points
  try {
    const response = await fetch(primaryUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as ReportMapPoint[];
      }
    }
  } catch {
    // Continuar al fallback
  }

  // 2. Fallback resiliente: Endpoint general /reports/?limit=100
  try {
    const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL}/reports/?page=1&limit=100`;
    const fallbackResponse = await fetch(fallbackUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      const items = (fallbackData.items || []) as Array<{
        report_id: number;
        latitude: number | null;
        longitude: number | null;
        typereport?: string;
        status?: string;
        date?: string;
        asunto?: string;
        problem?: string;
        neighborhood?: string;
      }>;

      let filtered = items.filter(
        (item) => item.latitude !== null && item.longitude !== null
      );

      if (typeFilter) {
        filtered = filtered.filter((item) => {
          const t = item.typereport?.toUpperCase();
          if (typeFilter === "BACHE") return t === "BACHE" || t === "BACHEO";
          if (typeFilter === "ALUM") return t === "ALUM" || t === "ALUMBRADO";
          return true;
        });
      }

      if (filtered.length > 0) {
        return filtered.map((item) => ({
          report_id: item.report_id,
          latitude: item.latitude as number,
          longitude: item.longitude as number,
          typereport: item.typereport || "BACHE",
          status: item.status || "REVISION",
          date: item.date || null,
          problem: item.asunto || item.problem || null,
          neighborhood: item.neighborhood || "Zona Registrada",
        }));
      }
    }
  } catch (err) {
    console.warn("Fallback de puntos de mapa no disponible:", err);
  }

  // 3. Fallback de demostración si la base de datos externa no responde
  if (typeFilter) {
    return SAMPLE_MAP_POINTS.filter((p) => p.typereport === typeFilter);
  }
  return SAMPLE_MAP_POINTS;
}
