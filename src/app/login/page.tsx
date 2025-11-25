"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginCredentials } from "@/utils/types";
import { validateEmail, validatePassword } from "@/utils/Validator";
import Eye from "/public/icons/eye.svg";
import EyeOff from "/public/icons/eye-off.svg";
import Figura from "/public/FigureLogin.svg";
import Escudo from "/public/icons/EscudoIcon.png";
import HeroImage from "/public/HeroImage.png";
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
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logoContainer}>
          <Image src={Figura} alt="Figura Login" className={styles.fondo} />

          <Image
            src={Escudo}
            alt="Escudo Icon"
            className={styles.escudo}
            width={80}
            height={80}
          />

          <Image
            src={logo}
            alt="MiReporte Logo"
            className={styles.logo}
            loading="eager"
            width={320}
            height={80}
          />
        </div>

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
            >
              {showPassword ? (
                <Image src={EyeOff} alt="Hide password" />
              ) : (
                <Image src={Eye} alt="Show password" />
              )}
            </span>
          </div>

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
        <Image src={HeroImage} className={styles.heroImage} alt="Hero Image" />
      </div>
    </div>
  );
};

export default LoginPage;
