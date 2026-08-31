"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboard } from "@/lib/dashboardPage";
import Image from "next/image";
import Link from "next/link";
import { rolePermissions } from "@/lib/permissions";
import styles from "@/app/dashboard/dashboard.module.css";

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !user) return null;

  const userPermissions = rolePermissions[user.role] ?? [];

  return (
    <div className="container-fluid py-4 px-lg-4">
      <div className={styles.header}>
        <div className={styles.headerGrow}>
          <div className={styles.greetingRow}>
            <h1 className={styles.greeting}>
              {dashboard.hero.title}
              {user.name}
            </h1>
            <span className={styles.roleBadge}>
              <i className="bi bi-person-gear"></i>
              {user.role}
            </span>
          </div>
          <p className={styles.subtitle}>{dashboard.hero.subtitle}</p>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>{dashboard.section}</h2>

      <div className="row g-4">
        {dashboard.cards
          .filter((card) => userPermissions.includes(card.permission))
          .map((card) => (
            <div
              key={card.title}
              className="col-12 col-sm-6 col-lg-4 col-xl-3"
            >
              <Link
                href={card.url}
                className={styles.card}
                style={
                  {
                    "--card-accent": card.color,
                    "--card-tint": hexToRgba(card.color, 0.12),
                    "--card-shadow": hexToRgba(card.color, 0.22),
                  } as React.CSSProperties
                }
                aria-label={card.title}
              >
                <span
                  className={styles.iconChip}
                  aria-hidden="true"
                >
                  <Image src={card.icon} alt="" width={30} height={30} />
                </span>

                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardDesc}>{card.desc}</p>

                <span className={styles.cardFooter}>
                  Abrir
                  <i className="bi bi-arrow-right"></i>
                </span>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}