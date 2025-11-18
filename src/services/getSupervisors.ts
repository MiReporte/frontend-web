import { SupervisorsResponse } from "@/utils/types";

export async function getSupervisors(
  token: string
): Promise<SupervisorsResponse[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/supervisors`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch supervisors");
  }
  return response.json();
}
