import { UserReportsResponse } from "@/utils/types";

export const getUserReports = async (
  token: string,
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<UserReportsResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reports/admin/get-user-reports/${userId}?page=${page}&limit=${limit}`,
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
      throw new Error(
        errorData.error || "Error al obtener reportes del usuario"
      );
    }

    const data = (await response.json()) as UserReportsResponse;
    console.log("User Reports Data:", data);
    return data;
  } catch (error) {
    throw new Error("Error fetching user reports: " + (error as Error).message);
  }
};
