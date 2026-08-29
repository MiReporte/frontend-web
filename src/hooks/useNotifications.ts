import { useContext } from "react";
import { NotificationsContext } from "@/lib/notificationsContext";
import { NotificationsContextType } from "@/utils/types";

/**
 * Custom hook para acceder al contexto global de notificaciones.
 * Debe usarse dentro de un <NotificationsProvider>.
 *
 * @throws Error si se usa fuera del proveedor.
 * @returns {NotificationsContextType} Estado y funciones de notificaciones.
 */
export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);

  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a <NotificationsProvider>"
    );
  }

  return context;
}
