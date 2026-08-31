import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Marca todas las notificaciones pendientes del usuario como leídas.
 * @param token JWT del usuario
 * @returns true si se marcaron correctamente
 */
export const markNotificationsAsRead = async (
  token: string
): Promise<boolean> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/notifications/mark-read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.msg || "Error al marcar notificaciones como leídas");
    }

    return true;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
