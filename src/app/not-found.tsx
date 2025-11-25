"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import NotFoundImage from "@/assets/Not-Found.png";
import Back from "@/assets/Back.svg";

export default function NotFound() {
  const pathname = usePathname();

  const backHref = pathname?.startsWith("/dashboard") ? "/dashboard" : "/login";

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row align-items-center justify-content-center text-center text-md-start">
        <div className="col-12 col-md-auto mb-4 mb-md-0">
          <Image
            src={NotFoundImage}
            alt="Página no encontrada"
            className="img-fluid"
            style={{
              maxWidth: "340px",
              height: "auto",
            }}
          />
        </div>

        <div className="col-12 col-md-auto ms-md-5">
          <h1
            className="fw-bold lh-1 mb-2"
            style={{ fontSize: "clamp(4rem, 10vw, 8rem)", color: "#111827" }}
          >
            404
          </h1>
          <h2 className="fs-3 text-secondary mb-4">Página no encontrada</h2>

          <Link
            href={backHref}
            className="d-inline-flex align-items-center text-decoration-none fw-medium fs-5"
            style={{ color: "#0070f3" }}
          >
            Regresar al inicio
            <Image
              src={Back}
              alt="Regresar"
              width={24}
              height={24}
              className="ms-2"
              style={{ transform: "rotate(180deg)" }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
