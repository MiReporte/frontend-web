import { UserRole } from "@/utils/types";

export const rolePermissions: Record<UserRole, string[]> = {
  Administrador: ["resumen", "usuarios", "reportes", "perfil", "ciudadanos"],
  "Mesa de servicios": ["resumen", "reportes", "perfil"],
  "Supervisor tecnico": ["reportes", "perfil"],
  "Usuario ciudadano": [],
};
