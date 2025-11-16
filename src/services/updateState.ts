import { UpdateStateBody, UpdateStateResponse } from "@/utils/types";

export async function updateStatus(
  body: UpdateStateBody,
  token: string
): Promise<UpdateStateResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reports/update-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error updating state: ${text}`);
  }

  return response.json();
}
