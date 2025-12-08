"use client";
import { rolePermissions } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Mireporte from "@/assets/MiReporte.png";
import Resumen from "@/assets/Resumen.svg";
import Analisis from "@/assets/Analisis.svg";
import Reportes from "@/assets/Reportes.svg";
import Usuarios from "@/assets/Usuarios.svg";
import Conceptos from "@/assets/Conceptos.svg";
import Profile from "@/assets/Profile.svg";
import Ciudadano from "@/assets/Ciudadano.svg";

export function Sidebar() {
  const { user } = useAuth();

  const pathname = usePathname();

  if (!user || user.role === "Usuario ciudadano") return null;

  const permissions = rolePermissions[user.role];
  const menuItems = [
    {
      key: "resumen",
      href: "/dashboard/resumen",
      label: "Resumen",
      icon: Resumen,
    },
    {
      key: "analisis",
      href: "/dashboard/analisis",
      label: "Análisis",
      icon: Analisis,
    },
    {
      key: "reportes",
      href: "/dashboard/reportes",
      label: "Reportes",
      icon: Reportes,
    },
    {
      key: "usuarios",
      href: "/dashboard/usuarios",
      label: "Usuarios",
      icon: Usuarios,
    },
    {
      key: "ciudadanos",
      href: "/dashboard/ciudadanos",
      label: "Ciudadanos",
      icon: Ciudadano,
    },
    {
      key: "conceptos",
      href: "/dashboard/catalogo",
      label: "Conceptos",
      icon: Conceptos,
    },
  ];

  return (
    <aside
      className="sidebar offcanvas-md offcanvas-start text-white d-flex flex-column p-3 border-end border-white border-opacity-10 shadow-sm"
      tabIndex={-1}
      id="sidebarMenu"
      aria-labelledby="sidebarMenuLabel"
      style={{
        width: "260px",
      }}
    >
      <div className="offcanvas-header mb-3">
        <h5 className="offcanvas-title text-white" id="sidebarMenuLabel">
          Menú
        </h5>
        <button
          type="button"
          className="btn-close btn-close-white"
          data-bs-dismiss="offcanvas"
          data-bs-target="#sidebarMenu"
          aria-label="Cerrar menú"
        ></button>
      </div>
      <div className="offcanvas-body d-flex flex-column h-100 justify-content-between p-0">
        <div>
          <div className="mb-4 text-center px-2">
            <Link href="/dashboard">
              <Image
                src={Mireporte}
                alt="Mi Reporte Logo"
                style={{
                  objectFit: "contain",
                  height: "auto",
                  maxWidth: "100%",
                }}
                width={180}
                height={90}
              />
            </Link>
          </div>
        </div>
        <nav className="nav flex-column gap-2">
          {menuItems.map(
            (item) =>
              permissions.includes(item.key) && (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`nav-link-custom ${
                    pathname === item.href ? "active" : ""
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt={`Icono ${item.label}`}
                    width={32}
                    height={32}
                  />
                  <span className="fs-5">{item.label}</span>
                </Link>
              )
          )}
        </nav>

        <div className="mt-4 pt-3 border-top border-white border-opacity-25">
          <Link
            href="/dashboard/profile"
            className="d-flex align-items-center gap-3 text-white text-decoration-none p-2 rounded hover-bg-light-10"
          >
            <Image
              src={user.image ?? Profile}
              alt={
                user.image
                  ? `${user.name} ${user.first_surname}`
                  : "Icono Perfil"
              }
              width={36}
              height={36}
              className="rounded-circle"
            />
            <div className="d-flex flex-column overflow-hidden">
              <span className="fw-bold text-truncate">{user.name}</span>
              <span className="small text-white-50 text-truncate">
                {user.email}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
