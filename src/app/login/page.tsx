"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/utils/types";
import { validateEmail, validatePassword } from "@/utils/Validator";
import HeroImage from "/public/HeroImage.png";
import Image from "next/image";
import logo from "@/assets/MiReporte.svg";
import styles from "./login.module.css";

const LoginPage = (): React.JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Image
            src={logo}
            alt="MiReporte Logo"
            className={styles.logo}
            loading="eager"
          />
          <h1 className={styles.title}>Iniciar sesión</h1>
          <p className={styles.description}>¡Bienvenido!</p>

          <label htmlFor="email">Ingresa tu usuario</label>
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

          <label htmlFor="password">Ingresa tu contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            aria-invalid={!!errors.password}
            required
          />

          {loginError && <p className={styles.error}>{loginError}</p>}

          <button type="submit" className={styles.button}>
            Iniciar sesión
          </button>

          <a href="/reset-password" className={styles.forgotPassword}>
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </div>

      <div className={styles.mapContainer}>
        <Image
          src={HeroImage}
          alt="Hero Image"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
