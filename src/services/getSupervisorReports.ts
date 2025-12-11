import { ResponseReports } from "@/utils/types";

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch supervisor reports");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("An error occurred while fetching supervisor reports");
  }
};
