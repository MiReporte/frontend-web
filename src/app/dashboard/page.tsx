"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { dashboard } from "@/lib/dashboardPage";
import Image from "next/image";
import { rolePermissions } from "@/lib/permissions";

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

  const iconBackgrounds = [
    "rgba(221, 22, 22, 0.12)",
    "rgba(201, 221, 22, 0.2)",
    "rgba(22, 137, 221, 0.14)",
    "rgba(22, 25, 221, 0.14)",
    "rgba(214, 22, 221, 0.16)",
    "rgba(137, 22, 221, 0.18)",
  ];

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column align-items-center mb-5 text-center">
        <h1
          className="fw-bold mb-2"
          style={{ fontSize: "2rem", color: "#111827" }}
        >
          {dashboard.hero.title} {user.name} 👋
        </h1>
        <p className="text-secondary fs-5 mb-0">{dashboard.hero.subtitle}</p>
      </div>

      <div className="row g-4 justify-content-center">
        {dashboard.cards
          .filter((card) => userPermissions.includes(card.permission))
          .map((card, index) => {
            const iconBg = iconBackgrounds[index % iconBackgrounds.length];

            return (
              <div
                key={card.title}
                className="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex justify-content-center"
              >
                <div
                  className="card border border-light-subtle shadow-sm h-100 align-items-center text-center p-4 w-100"
                  style={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onClick={() => router.push(card.url)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 .5rem 1rem rgba(0,0,0,.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 .125rem .25rem rgba(0,0,0,.075)";
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "4rem",
                      height: "4rem",
                      backgroundColor: iconBg,
                    }}
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={36}
                      height={36}
                    />
                  </div>

                  <h5 className="fw-semibold mb-2 text-dark">{card.title}</h5>
                  <p className="text-muted small mb-0">{card.desc}</p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
