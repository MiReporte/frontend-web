import { ResponseReports } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";

export const getSupervisorReports = async (
  token: string
): Promise<ResponseReports[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/get-assigned-reports`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `Failed to fetch supervisor reports (HTTP ${response.status})`
      );
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.items)) {
      return data.items;
    }
    if (Array.isArray(data?.reports)) {
      return data.reports;
    }
    return data ?? [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
