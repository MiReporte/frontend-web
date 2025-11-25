"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Notification from "@/assets/Notification.svg";

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const handleCloseSesion = () => {
    logout();
  };

  const getTitle = () => {
    if (pathname.includes("/dashboard/resumen")) return "Panel Resumen";
    if (pathname.includes("/dashboard/analisis")) return "Análisis Económico";
    if (pathname.includes("/dashboard/reportes")) return "Reportes Ciudadanos";
    if (pathname.includes("/dashboard/usuarios")) return "Gestión de Usuarios";
    if (pathname.includes("/dashboard/conceptos"))
      return "Catálogo de Conceptos";
    if (pathname.includes("/dashboard/profile")) return "Mi Perfil";
    return "Dashboard";
  };

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
            <div
              className="position-relative cursor-pointer"
              title="Notificaciones"
            >
              <Image
                src={Notification}
                alt="Icono Notificaciones"
                width={28}
                height={28}
              />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">Nuevas alertas</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
