import { CiudadanosResponse } from "@/utils/types";

export const getCiudadanos = async (
  token: string
): Promise<CiudadanosResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account/admin/get-users`,
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
        return {
          items: [],
          limit: 10,
          page: 1,
          total_pages: 1,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to fetch ciudadanos");
    }

    const data: CiudadanosResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error fetching ciudadanos: " + (error as Error).message);
  }
};
