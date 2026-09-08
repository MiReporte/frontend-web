import { UpdateImageResponse } from "@/utils/types";

/**
 * Uploads a new profile image for the authenticated user.
 *
 * @param token - JWT access token.
 * @param imageFile - The image file to upload.
 * @returns The success message and the new image URL.
 */
export async function updateProfileImage(
  token: string,
  imageFile: File
): Promise<UpdateImageResponse> {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/update-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || "Error al actualizar la imagen de perfil"
    );
  }

  return response.json();
}
