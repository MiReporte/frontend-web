"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/utils/types";
import { validateEmail, validatePassword } from "@/utils/Validator";
import Eye from "/public/icons/eye.svg";
import EyeOff from "/public/icons/eye-off.svg";
import Image from "next/image";
import logo from "@/assets/MiReporte.png";
import styles from "@/app/login/login.module.css";

const LoginPage = (): React.JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setLoginError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError ?? undefined,
        password: passwordError ?? undefined,
      });
      return;
    }

    try {
      const credentials: LoginCredentials = { email, password };
      const user = await login(credentials.email, credentials.password);

      if (!user) {
        setLoginError("Correo o contraseña incorrectos");
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      setLoginError(message);
    }
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
            <h1 className={styles.title}>Iniciar sesión</h1>

            <label htmlFor="email" className={styles.label}>
              Ingresa tu usuario
            </label>
            <input
              type="email"
              id="email"
              placeholder="Usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              aria-invalid={!!errors.email}
              required
            />

            <label htmlFor="password" className={styles.label}>
              Ingresa tu contraseña
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                aria-invalid={!!errors.password}
                required
              />

              <span
                className={styles.eyeIcon}
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <Image src={EyeOff} alt="Hide password" width={22} height={22} />
                ) : (
                  <Image src={Eye} alt="Show password" width={22} height={22} />
                )}
              </span>
            </div>

            {loginError && <p className={styles.error} role="alert">{loginError}</p>}

            <button type="submit" className={styles.button}>
              Iniciar sesión
            </button>

            <a href="/reset-password" className={styles.forgotPassword}>
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;