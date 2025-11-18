import { GetReportByIdResponse } from "@/utils/types";

/**
 * Fetches a report by its ID.
 * @param report_id - The ID of the report to fetch.
 * @param token - The authentication token.
 * @returns A promise that resolves to the report data.
 */
export async function getReportById(
  report_id: number,
  token: string
): Promise<GetReportByIdResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reports/get-reports-id/${report_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch report by ID: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}
