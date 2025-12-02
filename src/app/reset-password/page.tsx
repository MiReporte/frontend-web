"use client";

import { useState } from "react";
import { recoverRequest } from "@/services/recoverRequest";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await recoverRequest(email);

    if (res) {
      localStorage.setItem("verification_token", res.verification_token);
      router.push("/reset-password/verify");
    }
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
        <i className="bi bi-fingerprint fs-2"></i>
      </span>

      <h1>¿Olvidaste tu contraseña?</h1>

      <p className="mb-5" style={{ color: "#706f6fff" }}>
        Ingresa tu correo electrónico para restablecer tu contraseña.
      </p>

      <form className="w-100" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            className="form-control mb-4"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo electrónico"
            required
            style={{ height: "45px" }}
          />
        </div>

        <button
          type="submit"
          className="btn w-100 fw-semibold"
          style={{
            height: "45px",
            backgroundColor: "#611232",
            color: "white",
          }}
        >
          Restablecer contraseña
        </button>
      </form>

      <a
        className="d-flex align-items-center justify-content-center gap-2 mt-4 text-decoration-none"
        style={{ cursor: "pointer", color: "#424242ff" }}
        href="/login"
      >
        <i className="bi bi-arrow-left fs-5"></i>
        <p className="m-0 fw-semibold">Iniciar sesión</p>
      </a>
    </div>
  );
}
