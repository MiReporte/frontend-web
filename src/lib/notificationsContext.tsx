"use client";

import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import {
  NotificationItem,
  NewReportSocketPayload,
  NotificationsContextType,
} from "@/utils/types";
import { getNotifications } from "@/services/getNotifications";
import { getUnreadNotificationsCount } from "@/services/getUnreadNotificationsCount";
import { markNotificationsAsRead } from "@/services/markNotificationsAsRead";
import { NotificationToast } from "@/components/NotificationToast";

export const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const ALLOWED_ROLES = [
  "Administrador",
  "Mesa de servicios",
  "ADMIN",
  "MESA",
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastReportEvent, setLastReportEvent] =
    useState<NewReportSocketPayload | null>(null);
  const [activeToast, setActiveToast] = useState<{
    id: string;
    payload: NewReportSocketPayload;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Carga y sincroniza las notificaciones y el conteo de no leídas desde REST.
   */
  const refreshNotifications = useCallback(async () => {
    if (!user?.token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [fetchedNotifications, fetchedCount] = await Promise.all([
        getNotifications(user.token).catch((err) => {
          console.warn("No se pudieron cargar las notificaciones:", err);
          return [] as NotificationItem[];
        }),
        getUnreadNotificationsCount(user.token).catch((err) => {
          console.warn("No se pudo cargar el conteo de notificaciones:", err);
          return 0;
        }),
      ]);

      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedCount);
    } catch (error) {
      console.warn("Error sincronizando notificaciones:", error);
    }
  }, [user]);

  /**
   * Marca todas las notificaciones pendientes como leídas.
   */
  const markAllAsRead = useCallback(async () => {
    if (!user?.token) return;

    try {
      const success = await markNotificationsAsRead(user.token);
      if (success) {
        setUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
      }
    } catch (error) {
      console.error("Error al marcar notificaciones como leídas:", error);
    }
  }, [user]);

  /**
   * Carga inicial vía REST al autenticarse o cambiar de usuario.
   */
  useEffect(() => {
    let isCancelled = false;

    if (!user?.token) {
      return;
    }

    const loadData = async () => {
      try {
        const [fetchedNotifications, fetchedCount] = await Promise.all([
          getNotifications(user.token).catch(() => [] as NotificationItem[]),
          getUnreadNotificationsCount(user.token).catch(() => 0),
        ]);

        if (!isCancelled) {
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedCount);
        }
      } catch (err) {
        console.warn("Error cargando notificaciones iniciales:", err);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  /**
   * Conexión y gestión del ciclo de vida de Socket.IO.
   */
  useEffect(() => {
    const isRoleAllowed =
      user?.role &&
      ALLOWED_ROLES.some(
        (r) => r.toLowerCase() === user.role.toLowerCase()
      );

    if (!user?.token || !isRoleAllowed) {
      return;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    const socket = io(socketUrl, {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log(`[Socket.IO] Conectado exitosamente al servidor (${socketUrl})`);
      refreshNotifications();
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      console.warn("[Socket.IO] Error de conexión:", error.message);
    });

    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      console.log("[Socket.IO] Desconectado:", reason);
    });

    socket.on("report:created", (payload: NewReportSocketPayload) => {
      if (!payload?.notification || !payload?.report) return;

      // 1. Insertar la notificación al inicio evitando duplicados
      setNotifications((prev) => {
        const isDuplicate = prev.some(
          (n) =>
            n.report_id === payload.notification.report_id &&
            n.type === payload.notification.type &&
            n.date === payload.notification.date
        );

        if (isDuplicate) return prev;

        return [payload.notification, ...prev];
      });

      // 2. Incrementar el contador de no leídas
      setUnreadCount((prev) => prev + 1);

      // 3. Emitir señal para componentes dependientes (como ReportesPage)
      setLastReportEvent(payload);

      // 4. Mostrar toast visual
      setActiveToast({
        id: `${payload.report.report_id}-${Date.now()}`,
        payload,
      });

      // Auto-cerrar toast tras 6 segundos
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
    });

    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("report:created");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, refreshNotifications]);

  const handleCloseToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActiveToast(null);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        lastReportEvent,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
      <NotificationToast toast={activeToast} onClose={handleCloseToast} />
    </NotificationsContext.Provider>
  );
}
