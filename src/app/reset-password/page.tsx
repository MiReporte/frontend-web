"use client";

import { useState } from "react";
import { recoverRequest } from "@/services/recoverRequest";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/MiReporte.png";
import styles from "@/app/login/login.module.css";
import resetStyles from "@/app/reset-password/reset.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const res = await recoverRequest(email);

    if (!res || "error" in res) {
      setError(res.error || "No se pudo procesar la solicitud.");
      return;
    }

    if (!res.verification_token) {
      setError(
        "El correo no está registrado en el sistema. Verifica e inténtalo de nuevo."
      );
      return;
    }

    localStorage.setItem("verification_token", res.verification_token);
    router.push("/reset-password/verify");
  };

  return (
    <main className={styles.login}>
      <section className={styles.brand}>
        <Image
          src={logo}
          alt="MiReporte Logo"
          className={styles.brandLogo}
          loading="eager"
          priority
        />

        <svg
          className={styles.wave}
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,30 C240,75 480,-15 720,20 C960,55 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="#f2f2f2"
          />
        </svg>
      </section>

      <section className={styles.panel}>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <span className={`${resetStyles.iconBadge} d-flex`}>
              <i className="bi bi-fingerprint"></i>
            </span>

            <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
            <p className={resetStyles.subtitle}>
              Ingresa tu correo electrónico para restablecer tu contraseña.
            </p>

            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="Ingresa tu correo electrónico"
              required
              aria-invalid={!!error}
              style={{ borderColor: error ? "#dc3545" : undefined }}
            />

            {error && (
              <p className={`text-danger fw-semibold ${resetStyles.feedback}`}>
                {error}
              </p>
            )}

            <button type="submit" className={styles.button}>
              Restablecer contraseña
            </button>
          </form>

          <a
            href="/login"
            className={`${resetStyles.back} text-decoration-none`}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Iniciar sesión</span>
          </a>
        </div>
      </section>
    </main>
  );
}