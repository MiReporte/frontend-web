import type { AccountsResponse } from "@/utils/types";

export async function getStaff(token: string): Promise<AccountsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/staff`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch mesa_servicios and supervisors");
  }

  return response.json();
}
