import { EditStaffBody, EditStaffResponse } from "@/utils/types";

export async function editStaff(
  token: string,
  user_id: number,
  body: EditStaffBody
): Promise<EditStaffResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/update-user/${user_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al actualizar usuario");
  }

  return response.json();
}
