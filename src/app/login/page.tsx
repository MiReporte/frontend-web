"use client";
import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { LoginCredentials } from "@/utils/types";
import { validateEmail } from "@/utils/Validator";
import logo from "@/assets/MiReporte.svg";
import dynamic from "next/dynamic";
import styles from "./login.module.css";

const MapView = dynamic(() => import("@/components/OSMap"), {
  ssr: false,
});

const LoginPage = (): React.JSX.Element => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});
    setLoginError(null);

    const emailError = validateEmail(email);

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    const credentials: LoginCredentials = { email, password };

    const user = login(credentials.email, credentials.password);

    if (!user) {
      setLoginError("Correo o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
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
            required
          />
          {errors.email && (
            <div className={styles.errorMessage}>{errors.email}</div>
          )}

          <label htmlFor="password">Ingresa tu contraseña</label>
          <input
            type="password"
            id="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
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
        <MapView />
      </div>
    </div>
  );
};

export default LoginPage;
