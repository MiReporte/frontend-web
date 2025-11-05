"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bienvenido, {user.name} 👋</h1>
      <p className={styles.subtitle}>
        Estás en tu panel principal ({user.role}).
      </p>

      <div className={styles.content}>
        <p>Selecciona una opción del menú lateral para comenzar.</p>
      </div>
    </div>
  );
}
