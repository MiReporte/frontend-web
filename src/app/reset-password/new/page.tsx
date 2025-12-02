"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/services/changePassword";

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
    if (passwordsMatch) return "2px solid #28a745";
    if (passwordsNotMatch) return "2px solid #dc3545";
    return "1px solid #ced4da";
  };

  return (
    <div
      className="container d-flex flex-column align-items-center justify-content-center w-100"
      style={{ maxWidth: "500px", height: "100vh" }}
    >
      <span
        className="border rounded-4 d-flex align-items-center justify-content-center mb-4"
        style={{ width: "60px", height: "60px", borderWidth: "3px" }}
      >
        <i className="bi bi-key fs-2"></i>
      </span>

      <h1>Nueva contraseña</h1>
      <p className="mb-5" style={{ color: "#706f6fff" }}>
        Ingresa tu nueva contraseña para completar el proceso.
      </p>

      <form className="w-100" onSubmit={handleSubmit}>
        <div className="mb-3 position-relative">
          <label htmlFor="password" className="form-label">
            Nueva contraseña
          </label>

          <input
            type={showPass ? "text" : "password"}
            className="form-control pe-5"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Ingresa tu nueva contraseña"
            required
            style={{
              height: "45px",
              border: getBorderColor(),
            }}
          />

          <i
            className={`bi ${
              showPass ? "bi-eye-slash" : "bi-eye"
            } position-absolute`}
            style={{
              top: "52%",
              right: "15px",
              cursor: "pointer",
              color: "#666",
              fontSize: "1.2rem",
            }}
            onClick={() => setShowPass(!showPass)}
          ></i>
        </div>

        <div className="mb-3 position-relative">
          <label htmlFor="confirm" className="form-label">
            Confirmar contraseña
          </label>

          <input
            type={showConfirm ? "text" : "password"}
            className="form-control pe-5"
            id="confirm"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError("");
            }}
            placeholder="Confirma la contraseña"
            required
            style={{
              height: "45px",
              border: getBorderColor(),
            }}
          />

          <i
            className={`bi ${
              showConfirm ? "bi-eye-slash" : "bi-eye"
            } position-absolute`}
            style={{
              top: "52%",
              right: "15px",
              cursor: "pointer",
              color: "#666",
              fontSize: "1.2rem",
            }}
            onClick={() => setShowConfirm(!showConfirm)}
          ></i>
        </div>

        {error && <p className="text-danger fw-semibold mb-3">{error}</p>}

        {success && <p className="text-success fw-semibold mb-3">{success}</p>}

        <button
          type="submit"
          className="btn btn-success w-100 fw-semibold"
          style={{ height: "45px", backgroundColor: "#611232", color: "white" }}
        >
          Cambiar contraseña
        </button>
      </form>

      <a
        className="d-flex align-items-center justify-content-center gap-2 mt-4 text-decoration-none"
        style={{ cursor: "pointer", color: "#424242ff" }}
        href="/login"
      >
        <i className="bi bi-arrow-left fs-5"></i>
        <p className="m-0 fw-semibold">Ir a iniciar sesión</p>
      </a>
    </div>
  );
}
