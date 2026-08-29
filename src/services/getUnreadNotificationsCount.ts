import { UnreadNotificationsCountResponse } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Obtiene la cantidad de notificaciones no leídas del usuario autenticado.
 * @param token JWT del usuario
 * @returns Conteo de notificaciones no leídas
 */
export const getUnreadNotificationsCount = async (
  token: string
): Promise<number> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/notifications/unread-count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return 0;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.msg || "Error al obtener conteo de no leídas");
    }

    const data: UnreadNotificationsCountResponse = await response.json();
    return typeof data.unread_count === "number" ? data.unread_count : 0;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
