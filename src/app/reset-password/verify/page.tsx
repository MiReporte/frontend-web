"use client";

import { useState } from "react";
import { verifyCode } from "@/services/verifyCode";
import { useRouter } from "next/navigation";

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
    <div
      className="container d-flex flex-column align-items-center justify-content-center w-100"
      style={{ maxWidth: "500px", height: "100vh" }}
    >
      <span
        className="border rounded-4 d-flex align-items-center justify-content-center mb-4"
        style={{ width: "60px", height: "60px", borderWidth: "3px" }}
      >
        <i className="bi bi-shield-lock fs-2"></i>
      </span>

      <h1>Verificar código</h1>
      <p className="mb-5" style={{ color: "#706f6fff" }}>
        Ingresa el código de verificación que enviamos a tu correo electrónico.
      </p>

      <form className="w-100" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="code" className="form-label">
            Código de verificación
          </label>

          <input
            type="text"
            className="form-control mb-2"
            id="code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            placeholder="Ingresa el código"
            required
            maxLength={6}
            style={{
              height: "45px",
              borderColor: error ? "#dc3545" : "#ced4da",
            }}
          />

          {error && <small className="text-danger fw-semibold">{error}</small>}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 fw-semibold"
          style={{ height: "45px", backgroundColor: "#611232", color: "white" }}
        >
          Verificar código
        </button>
      </form>

      <a
        className="d-flex align-items-center justify-content-center gap-2 mt-4 text-decoration-none"
        style={{ cursor: "pointer", color: "#424242ff" }}
        href="/reset-password"
      >
        <i className="bi bi-arrow-left fs-5"></i>
        <p className="m-0 fw-semibold">Volver</p>
      </a>
    </div>
  );
}
