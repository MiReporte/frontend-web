"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NotificationIcon from "@/assets/Notification.svg";
import { NotificationItem } from "@/utils/types";

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const handleCloseSesion = () => {
    logout();
  };

  const handleToggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const handleNotificationClick = (reportId?: number | null) => {
    setIsOpen(false);
    if (reportId) {
      router.push(`/dashboard/reportes?report_id=${reportId}`);
    } else {
      router.push(`/dashboard/reportes`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  const getTitle = () => {
    if (pathname.includes("/dashboard/resumen")) return "Panel Resumen";
    if (pathname.includes("/dashboard/analisis")) return "Análisis Económico";
    if (pathname.includes("/dashboard/reportes")) return "Reportes Ciudadanos";
    if (pathname.includes("/dashboard/usuarios")) return "Gestión de Usuarios";
    if (pathname.includes("/dashboard/catalogo")) return "Catalogo de Conceptos";
    if (pathname.includes("/dashboard/ciudadanos"))
      return "Gestión de Ciudadanos";
    if (pathname.includes("/dashboard/profile")) return "Mi Perfil";
    return "Dashboard";
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header
      className="navbar navbar-expand-md navbar-light bg-white border-bottom sticky-top py-3 px-3 px-md-4 shadow-sm"
      style={{ height: "80px" }}
    >
      <div className="container-fluid p-0">
        <button
          className="navbar-toggler d-md-none me-3 border-0 p-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <h1 className="h4 m-0 flex-grow-1 fw-bold text-dark text-truncate">
          {getTitle()}
        </h1>

        <div className="d-flex align-items-center">
          {pathname.includes("/dashboard/profile") ? (
            <button
              type="button"
              onClick={handleCloseSesion}
              className="btn btn-link p-0 border-0 d-flex align-items-center text-decoration-none"
              title="Cerrar Sesión"
            >
              <span className="d-none d-sm-inline me-2 text-secondary fw-medium">
                Salir
              </span>

              <i
                className="bi bi-box-arrow-right fs-4 text-danger"
                style={{ cursor: "pointer" }}
              ></i>
            </button>
          ) : (
            <div className="dropdown position-relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={handleToggleDropdown}
                className="btn btn-link p-0 border-0 position-relative text-decoration-none"
                aria-label={
                  unreadCount > 0
                    ? `Notificaciones (${unreadCount} no leídas)`
                    : "Notificaciones"
                }
                aria-expanded={isOpen}
                aria-haspopup="true"
                id="notificationsDropdownButton"
              >
                <Image
                  src={NotificationIcon}
                  alt="Icono Notificaciones"
                  width={28}
                  height={28}
                />
                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-flex align-items-center justify-content-center"
                    style={{
                      fontSize: "0.65rem",
                      minWidth: "18px",
                      height: "18px",
                      padding: "2px 4px",
                    }}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                    <span className="visually-hidden">
                      notificaciones no leídas
                    </span>
                  </span>
                )}
              </button>

              {isOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end show shadow-lg border-0 p-0 mt-2"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    left: "auto",
                    width: "320px",
                    maxWidth: "calc(100vw - 32px)",
                    borderRadius: "12px",
                    zIndex: 1050,
                  }}
                  aria-labelledby="notificationsDropdownButton"
                >
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2 text-white"
                    style={{
                      backgroundColor: "#611232",
                      borderTopLeftRadius: "12px",
                      borderTopRightRadius: "12px",
                    }}
                  >
                    <span className="fw-bold small">Notificaciones</span>
                    {notifications.length > 0 && (
                      <span className="badge bg-white text-dark small">
                        {notifications.length} total
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      maxHeight: "340px",
                      overflowY: "auto",
                    }}
                  >
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map(
                        (item: NotificationItem, idx: number) => (
                          <button
                            key={item.id ? `${item.id}-${idx}` : idx}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(item.report_id)
                            }
                            className={`dropdown-item p-3 border-bottom text-wrap text-start d-flex flex-column gap-1 ${
                              !item.is_read ? "bg-light" : ""
                            }`}
                            style={{ whiteSpace: "normal" }}
                          >
                            <div className="d-flex justify-content-between align-items-start w-100">
                              <span className="fw-semibold small text-dark">
                                {item.message}
                              </span>
                              {!item.is_read && (
                                <span
                                  className="badge bg-primary rounded-pill ms-1"
                                  style={{ fontSize: "0.55rem" }}
                                >
                                  Nueva
                                </span>
                              )}
                            </div>
                            {item.date && (
                              <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                <i className="bi bi-clock me-1"></i>
                                {formatDate(item.date)}
                              </small>
                            )}
                          </button>
                        )
                      )
                    ) : (
                      <div className="p-4 text-center text-muted">
                        <i className="bi bi-bell-slash fs-3 d-block mb-2 text-secondary"></i>
                        <span className="small">No hay notificaciones</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-top bg-light text-center">
                    <Link
                      href="/dashboard/reportes"
                      className="btn btn-sm btn-link text-decoration-none fw-medium"
                      style={{ color: "#611232", fontSize: "0.85rem" }}
                      onClick={() => setIsOpen(false)}
                    >
                      Ver todos los reportes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
