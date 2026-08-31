import { NotificationItem } from "@/utils/types";
import { getErrorMessage } from "@/utils/errorHandler";

/**
 * Obtiene el historial de notificaciones del usuario autenticado.
 * @param token JWT del usuario
 * @returns Lista de notificaciones
 */
export const getNotifications = async (
  token: string
): Promise<NotificationItem[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/notifications/my-notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.msg || "Error al obtener notificaciones");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
