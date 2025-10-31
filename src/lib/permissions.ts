export type UserRole =
  | "administrador"
  | "mesa_servicios"
  | "supervisor_tecnico"
  | "usuario_ciudadano";

export const rolePermissions: Record<
  Exclude<UserRole, "usuario_ciudadano">,
  string[]
> = {
  administrador: [
    "resumen",
    "analisis",
    "usuarios",
    "reportes",
    "conceptos",
    "perfil",
  ],
  mesa_servicios: ["resumen", "usuarios", "reportes", "perfil"],
  supervisor_tecnico: ["reportes", "conceptos", "perfil"],
};
