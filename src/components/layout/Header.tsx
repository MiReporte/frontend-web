"use client";

import { useAuth } from "@/lib/useAuth";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Notification from "@/assets/Notification.svg";
import styles from "@/components/layout/Header.module.css";

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        {pathname.includes("/dashboard/resumen") && " Panel Resumen"}
        {pathname.includes("/dashboard/analisis") && "Análisis Económico"}
        {pathname.includes("/dashboard/reportes") && "Reportes Ciudadanos"}
        {pathname.includes("/dashboard/usuarios") && "Gestión de Usuarios"}
        {pathname.includes("/dashboard/conceptos") && "Catálogo de Conceptos"}
        {pathname.includes("/dashboard/profile") && "Mi Perfil"}
      </h1>
      <Image
        src={Notification}
        alt="Icono Notificaciones"
        width={32}
        height={32}
        className={styles.notificationIcon}
      />
    </header>
  );
}
