"use client";

import { useState } from "react";
import { verifyCode } from "@/services/verifyCode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/assets/MiReporte.png";
import styles from "@/app/login/login.module.css";
import resetStyles from "@/app/reset-password/reset.module.css";

export default function VerificarCodigoPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const verification_token = localStorage.getItem("verification_token");

    if (!verification_token) {
      setError("No se encontró el token. Solicita el código nuevamente.");
      return;
    }

    const res = await verifyCode(code, verification_token);

    if (res?.reset_token) {
      localStorage.setItem("reset_token", res.reset_token);
      router.push("/reset-password/new");
      return;
    }

    setError("El código ingresado es incorrecto o expiró.");
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
              <i className="bi bi-shield-lock"></i>
            </span>

            <h1 className={styles.title}>Verificar código</h1>
            <p className={resetStyles.subtitle}>
              Ingresa el código de verificación que enviamos a tu correo
              electrónico.
            </p>

            <label htmlFor="code" className={styles.label}>
              Código de verificación
            </label>
            <input
              type="text"
              id="code"
              className={styles.input}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder="Ingresa el código"
              required
              maxLength={6}
              aria-invalid={!!error}
              style={{ borderColor: error ? "#dc3545" : undefined }}
            />

            {error && (
              <p className={`text-danger fw-semibold ${resetStyles.feedback}`}>
                {error}
              </p>
            )}

            <button type="submit" className={styles.button}>
              Verificar código
            </button>
          </form>

          <a
            href="/reset-password"
            className={`${resetStyles.back} text-decoration-none`}
          >
            <i className="bi bi-arrow-left"></i>
            <span>Volver</span>
          </a>
        </div>
      </section>
    </main>
  );
}