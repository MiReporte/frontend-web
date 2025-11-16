"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "@/app/not-found.module.css";
import "@/app/globals.css";
import NotFound from "@/assets/Not-Found.png";
import Image from "next/image";
import Back from "@/assets/Back.svg";

export default function NotFoundPage() {
  const pathname = usePathname();

  return (
    <div className={styles.notFound}>
      <Image
        src={NotFound}
        alt="Página no encontrada"
        className={styles.image}
      />
      <div className={styles.textContainer}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Página no encontrada</h2>
        <Link
          href={pathname.startsWith("/dashboard") ? "/dashboard" : "/"}
          className={styles.link}
        >
          Regresar al inicio
          <Image src={Back} alt="Regresar" className={styles.backIcon} />
        </Link>
      </div>
    </div>
  );
}
