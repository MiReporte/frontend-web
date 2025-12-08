import { UserRole } from "@/utils/types";

export const rolePermissions: Record<UserRole, string[]> = {
  Administrador: [
    "resumen",
    "analisis",
    "usuarios",
    "reportes",
    "conceptos",
    "perfil",
    "ciudadanos",
  ],
  "Mesa de servicios": ["resumen", "reportes", "perfil"],
  "Supervisor tecnico": ["reportes", "conceptos", "perfil"],
  "Usuario ciudadano": [],
};
