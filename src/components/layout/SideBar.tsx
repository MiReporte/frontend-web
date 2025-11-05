"use client";

import { rolePermissions } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import styles from "@/components/layout/SideBar.module.css";
import Link from "next/link";
import Image from "next/image";
import Mireporte from "@/assets/MiReporte.svg";
import Resumen from "@/assets/Resumen.svg";
import Analisis from "@/assets/Analisis.svg";
import Reportes from "@/assets/Reportes.svg";
import Usuarios from "@/assets/Usuarios.svg";
import Conceptos from "@/assets/Conceptos.svg";
import Profile from "@/assets/Profile.svg";

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || user.role === "Usuario ciudadano") return null;

  const permissions = rolePermissions[user.role];

  return (
    <aside className={styles.sidebar}>
      <Image
        src={Mireporte}
        alt="Mi Reporte Logo"
        className={styles.logo}
        width={150}
        height={50}
      />

      <ul className={styles.list}>
        {permissions.includes("resumen") && (
          <li className={styles.listItem}>
            <Link
              href="/dashboard/resumen"
              className={`${styles.link} ${
                pathname === "/dashboard/resumen" ? styles.active : ""
              }`}
            >
              <Image
                src={Resumen}
                alt="Icono Resumen"
                width={32}
                height={32}
                className={styles.icon}
              />
              <span>Resumen</span>
            </Link>
          </li>
        )}
        {permissions.includes("analisis") && (
          <li className={styles.listItem}>
            <Link
              href="/dashboard/analisis"
              className={`${styles.link} ${
                pathname === "/dashboard/analisis" ? styles.active : ""
              }`}
            >
              <Image
                src={Analisis}
                alt="Icono Análisis"
                width={32}
                height={32}
                className={styles.icon}
              />
              <span>Análisis</span>
            </Link>
          </li>
        )}
        {permissions.includes("reportes") && (
          <li className={styles.listItem}>
            <Link
              href="/dashboard/reportes"
              className={`${styles.link} ${
                pathname === "/dashboard/reportes" ? styles.active : ""
              }`}
            >
              <Image
                src={Reportes}
                alt="Icono Reportes"
                width={32}
                height={32}
                className={styles.icon}
              />
              <span>Reportes</span>
            </Link>
          </li>
        )}
        {permissions.includes("usuarios") && (
          <li className={styles.listItem}>
            <Link
              href="/dashboard/usuarios"
              className={`${styles.link} ${
                pathname === "/dashboard/usuarios" ? styles.active : ""
              }`}
            >
              <Image
                src={Usuarios}
                alt="Icono Usuarios"
                width={32}
                height={32}
                className={styles.icon}
              />
              <span>Usuarios</span>
            </Link>
          </li>
        )}
        {permissions.includes("conceptos") && (
          <li className={styles.listItem}>
            <Link
              href="/dashboard/conceptos"
              className={`${styles.link} ${
                pathname === "/dashboard/conceptos" ? styles.active : ""
              }`}
            >
              <Image
                src={Conceptos}
                alt="Icono Conceptos"
                width={32}
                height={32}
                className={styles.icon}
              />
              <span>Conceptos</span>
            </Link>
          </li>
        )}
      </ul>
      <Link href="/dashboard/profile" className={styles.userInfo}>
        <Image src={Profile} alt="Icono Perfil" width={32} height={32} />
        <div className={styles.userDetails}>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </div>
      </Link>
    </aside>
  );
}
