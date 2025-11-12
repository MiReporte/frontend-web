"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboard } from "@/lib/dashboardPage";
import Image from "next/image";
import styles from "@/app/dashboard/DashboardPage.module.css";

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
    <>
      <div className={styles.welcomeContainer}>
        <h1 className={styles.title}>
          {dashboard.hero.title} {user.name} 👋
        </h1>
        <p className={styles.subtitle}>{dashboard.hero.subtitle}</p>
      </div>
      <div className={styles.cardsContainer}>
        {dashboard.cards.map((card) => (
          <span
            key={card.title}
            className={styles.card}
            onClick={() => router.push(card.url)}
          >
            <span className={styles.iconContainer}>
              <Image src={card.icon} alt={card.title} width={36} height={36} />
            </span>
            <p className={styles.cardTitle}>{card.title}</p>
            <p className={styles.cardDesc}>{card.desc}</p>
          </span>
        ))}
      </div>
    </>
  );
}
