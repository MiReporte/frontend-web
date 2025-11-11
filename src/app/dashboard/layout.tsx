"use client";

import { Sidebar } from "@/components/layout/SideBar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import LoadingImage from "@/components/LoadingImage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (hydrated && (!isLoggedIn || user?.role === "Usuario ciudadano")) {
      router.push("/login");
    }
  }, [hydrated, isLoggedIn, user, router]);

  if (!hydrated || !isLoggedIn || !user) return <LoadingImage />;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Header />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
