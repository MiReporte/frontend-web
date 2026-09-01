"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/services/changePassword";
import Eye from "/public/icons/eye.svg";
import EyeOff from "/public/icons/eye-off.svg";
import Image from "next/image";
import logo from "@/assets/MiReporte.png";
import styles from "@/app/login/login.module.css";
import resetStyles from "@/app/reset-password/reset.module.css";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const router = useRouter();

  const passwordsMatch = password && confirm && password === confirm;
  const passwordsNotMatch = password && confirm && password !== confirm;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const reset_token = localStorage.getItem("reset_token");

    if (!reset_token) {
      setError("Token no encontrado. Repite el proceso de recuperación.");
      return;
    }

    const res = await changePassword(password, reset_token);

    if (res?.msg) {
      setSuccess("Contraseña cambiada exitosamente. Redirigiendo...");
      localStorage.removeItem("reset_token");
      localStorage.removeItem("verification_token");

      setTimeout(() => router.push("/login"), 1200);
      return;
    }

    setError("Ocurrió un error al cambiar la contraseña. Intenta de nuevo.");
  };

  const getBorderColor = () => {
    if (passwordsMatch) return "#28a745";
    if (passwordsNotMatch) return "#dc3545";
    return undefined;
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
              <i className="bi bi-key"></i>
            </span>

            <h1 className={styles.title}>Nueva contraseña</h1>
            <p className={resetStyles.subtitle}>
              Ingresa tu nueva contraseña para completar el proceso.
            </p>

            <label htmlFor="password" className={styles.label}>
              Nueva contraseña
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPass ? "text" : "password"}
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Ingresa tu nueva contraseña"
                required
                style={{ borderColor: getBorderColor() }}
              />

              <span
                className={styles.eyeIcon}
                onClick={() => setShowPass(!showPass)}
                role="button"
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? (
                  <Image
                    src={EyeOff}
                    alt="Hide password"
                    width={22}
                    height={22}
                  />
                ) : (
                  <Image
                    src={Eye}
                    alt="Show password"
                    width={22}
                    height={22}
                  />
                )}
              </span>
            </div>

            <label htmlFor="confirm" className={styles.label}>
              Confirmar contraseña
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirm ? "text" : "password"}
                id="confirm"
                className={styles.input}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                placeholder="Confirma la contraseña"
                required
                style={{ borderColor: getBorderColor() }}
              />

              <span
                className={styles.eyeIcon}
                onClick={() => setShowConfirm(!showConfirm)}
                role="button"
                aria-label={
                  showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showConfirm ? (
                  <Image
                    src={EyeOff}
                    alt="Hide password"
                    width={22}
                    height={22}
                  />
                ) : (
                  <Image
                    src={Eye}
                    alt="Show password"
                    width={22}
                    height={22}
                  />
                )}
              </span>
            </div>

            {error && (
              <p className={`text-danger fw-semibold ${resetStyles.feedback}`}>
                {error}
              </p>
            )}

            {success && (
              <p className={`text-success fw-semibold ${resetStyles.feedback}`}>
                {success}
              </p>
            )}

            <button type="submit" className={styles.button}>
              Cambiar contraseña
            </button>
          </form>

          <a href="/login" className={`${resetStyles.back} text-decoration-none`}>
            <i className="bi bi-arrow-left"></i>
            <span>Ir a iniciar sesión</span>
          </a>
        </div>
      </section>
    </main>
  );
}