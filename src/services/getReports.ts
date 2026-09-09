import { PaginatedResponse } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Fetches reports from the API with pagination and optional status, user, location, and date range filtering.
 * @param page page number
 * @param limit limit of reports per page
 * @param status status filter for reports
 * @param userId optional citizen account_id filter
 * @param location optional search term for location/neighborhood/description
 * @param startDate optional start date filter (YYYY-MM-DD)
 * @param endDate optional end date filter (YYYY-MM-DD)
 * @returns PaginatedResponse containing reports data
 */
export const getReports = async (
  page = 1,
  limit = 10,
  status = "",
  userId?: number | null,
  location?: string | null,
  startDate?: string | null,
  endDate?: string | null
): Promise<PaginatedResponse> => {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (status) params.set("status", status);
    if (userId) params.set("user_id", String(userId));
    if (location && location.trim()) params.set("location", location.trim());

    if (startDate && startDate.trim()) {
      const s = startDate.trim();
      params.set("start_date", s);
      params.set("date_from", s);
    }

    if (endDate && endDate.trim()) {
      const e = endDate.trim();
      params.set("end_date", e);
      params.set("date_to", e);
    }

    // Si startDate y endDate son iguales (mismo día), enviamos también "date"
    if (startDate && endDate && startDate.trim() === endDate.trim()) {
      params.set("date", startDate.trim());
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // No hay reportes para este filtro
        return {
          items: [],
          limit,
          page,
          totalItems: 0,
          totalPages: 1,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch reports");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
