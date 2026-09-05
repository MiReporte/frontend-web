import { PaginatedResponse } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Fetches reports from the API with pagination and optional status and user filtering.
 * @param page page number
 * @param limit limit of reports per page
 * @param status status filter for reports
 * @param userId optional citizen account_id filter
 * @returns PaginatedResponse containing reports data
 */
export const getReports = async (
  page = 1,
  limit = 10,
  status = "",
  userId?: number | null
): Promise<PaginatedResponse> => {
  try {
    const userQuery = userId ? `&user_id=${userId}` : "";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/?page=${page}&limit=${limit}&status=${status}${userQuery}`,
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
