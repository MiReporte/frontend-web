"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import NotificationIcon from "@/assets/Notification.svg";
import { NotificationItem } from "@/utils/types";
import styles from "@/components/layout/layout.module.css";

export function Header() {
  const { user } = useAuth();
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
    if (pathname.includes("/dashboard/reportes")) return "Reportes Ciudadanos";
    if (pathname.includes("/dashboard/usuarios")) return "Gestión de Usuarios";
    if (pathname.includes("/dashboard/ciudadanos"))
      return "Gestión de Ciudadanos";
    if (pathname.includes("/dashboard/profile")) return "Mi Perfil";
    return "Dashboard";
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <button
          className={`${styles.toggleBtn} d-md-none`}
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarMenu"
          aria-controls="sidebarMenu"
          aria-label="Abrir menú"
        >
          <i className="bi bi-list"></i>
        </button>

        <h1 className={styles.headerTitle}>{getTitle()}</h1>

        <div className={styles.headerActions}>
          <div className="dropdown position-relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={handleToggleDropdown}
              className={styles.bellBtn}
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
                    width={24}
                    height={24}
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
                    className={styles.notifPanel}
                    aria-labelledby="notificationsDropdownButton"
                  >
                    <div className={styles.notifHeader}>
                      <span className={styles.notifTitle}>
                        <i className="bi bi-bell-fill"></i>
                        Notificaciones
                      </span>
                      <span className={styles.notifCount}>
                        {notifications.length}
                      </span>
                    </div>

                    <div className={styles.notifList}>
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map(
                          (item: NotificationItem, idx: number) => (
                            <button
                              key={item.id ? `${item.id}-${idx}` : idx}
                              type="button"
                              onClick={() =>
                                handleNotificationClick(item.report_id)
                              }
                              className={`${styles.notifItem} ${
                                !item.is_read ? styles.notifItemUnread : ""
                              }`}
                            >
                              <span className={styles.notifIcon}>
                                <Image
                                  src={NotificationIcon}
                                  alt=""
                                  width={20}
                                  height={20}
                                />
                              </span>
                              <span className={styles.notifContent}>
                                <span className={styles.notifMsg}>
                                  {item.message}
                                </span>
                                {item.date && (
                                  <span className={styles.notifTime}>
                                    <i className="bi bi-clock"></i>
                                    {formatDate(item.date)}
                                  </span>
                                )}
                              </span>
                              {!item.is_read && (
                                <span
                                  className={styles.notifDot}
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          )
                        )
                      ) : (
                        <div className={styles.notifEmpty}>
                          <span className={styles.notifEmptyIcon}>
                            <i className="bi bi-bell-slash"></i>
                          </span>
                          <strong>Sin notificaciones</strong>
                          <small>
                            Los nuevos reportes aparecerán aquí en tiempo real
                          </small>
                        </div>
                      )}
                    </div>

                    <div className={styles.notifFooter}>
                      <Link
                        href="/dashboard/reportes"
                        className={styles.notifFooterLink}
                        onClick={() => setIsOpen(false)}
                      >
                        Ver todos los reportes
                        <i className="bi bi-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
        </div>
      </div>
    </header>
  );
}