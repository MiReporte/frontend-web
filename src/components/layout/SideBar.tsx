"use client";
import { rolePermissions } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Mireporte from "@/assets/MiReporte.png";
import Resumen from "@/assets/Resumen.svg";
import Reportes from "@/assets/Reportes.svg";
import Usuarios from "@/assets/Usuarios.svg";
import Profile from "@/assets/Profile.svg";
import Ciudadano from "@/assets/Ciudadano.svg";
import styles from "@/components/layout/layout.module.css";

export function Sidebar() {
  const { user } = useAuth();

  const pathname = usePathname();

  if (!user || user.role === "Usuario ciudadano") return null;

  const permissions = rolePermissions[user.role];

  const menuItems = [
    {
      key: "inicio",
      href: "/dashboard",
      label: "Inicio",
      icon: null,
      bootstrapIcon: "bi-house-fill",
      alwaysVisible: true,
    },
    {
      key: "resumen",
      href: "/dashboard/resumen",
      label: "Resumen",
      icon: Resumen,
      bootstrapIcon: null,
      alwaysVisible: false,
    },
    {
      key: "reportes",
      href: "/dashboard/reportes",
      label: "Reportes",
      icon: Reportes,
      bootstrapIcon: null,
      alwaysVisible: false,
    },
    {
      key: "usuarios",
      href: "/dashboard/usuarios",
      label: "Usuarios",
      icon: Usuarios,
      bootstrapIcon: null,
      alwaysVisible: false,
    },
    {
      key: "ciudadanos",
      href: "/dashboard/ciudadanos",
      label: "Ciudadanos",
      icon: Ciudadano,
      bootstrapIcon: null,
      alwaysVisible: false,
    },
  ];

  const visibleItems = menuItems.filter(
    (item) => item.alwaysVisible || permissions.includes(item.key)
  );

  return (
    <aside
      className={`sidebar offcanvas-md offcanvas-start ${styles.sidebar}`}
      tabIndex={-1}
      id="sidebarMenu"
      aria-labelledby="sidebarMenuLabel"
    >
      <div className="offcanvas-header p-0 border-0 d-md-none">
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

      <div className="offcanvas-body d-flex flex-column h-100 p-0">
        <div className={styles.brand}>
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

        <div className={styles.userCard}>
          <Image
            src={user.image ?? Profile}
            alt={
              user.image
                ? `${user.name} ${user.first_surname}`
                : "Icono Perfil"
            }
            width={40}
            height={40}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user.name} {user.first_surname}
            </span>
            <span className={styles.roleBadge}>
              <i className="bi bi-person-gear"></i>
              {user.role}
            </span>
          </div>
        </div>

        <p className={styles.navLabel}>Navegación</p>

        <nav className={styles.nav} aria-label="Navegación principal">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt=""
                      width={26}
                      height={26}
                    />
                  ) : (
                    <i className={`bi ${item.bootstrapIcon}`}></i>
                  )}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.profileDock}>
          <Link
            href="/dashboard/profile"
            className={styles.profileLink}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <i className="bi bi-person-circle"></i>
            </span>
            <span>Mi perfil</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}