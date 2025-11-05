import { UserRole } from "@/utils/types";

/**
 * Permissions associated with each user role.
 */
export const rolePermissions: Record<
  Exclude<UserRole, "Usuario ciudadano">,
  string[]
> = {
  Administrador: [
    "resumen",
    "analisis",
    "usuarios",
    "reportes",
    "conceptos",
    "perfil",
  ],
  "Mesa de servicios": ["resumen", "usuarios", "reportes", "perfil"],
  "Supervisor tecnico": ["reportes", "conceptos", "perfil"],
};
