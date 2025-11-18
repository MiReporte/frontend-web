import {
  UpdateSupervisorReportBody,
  UpdateSupervisorReportResponse,
} from "@/utils/types";

export async function updateSupervisorReport(
  body: UpdateSupervisorReportBody,
  token: string
): Promise<UpdateSupervisorReportResponse> {
  console.log("Payload enviado:", JSON.stringify(body));
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reports/update-supervisor`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error || data?.message || "Failed to update supervisor"
    );
  }

  return data;
}
