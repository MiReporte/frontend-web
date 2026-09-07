import { UpdatePasswordBody, UpdatePasswordResponse } from "@/utils/types";

/**
 * Updates the password for the authenticated user.
 *
 * @param token - JWT access token.
 * @param body - Object containing old_password and new_password.
 * @returns The success message.
 */
export async function updatePassword(
  token: string,
  body: UpdatePasswordBody
): Promise<UpdatePasswordResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/update-password`,
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
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || "Error al actualizar la contraseña"
    );
  }

  return response.json();
}
