export interface LoginCredentials {
  email: string;
  password: string;
}

export type UserRole =
  | "administrador"
  | "mesa_servicios"
  | "supervisor_tecnico"
  | "usuario_ciudadano";

export interface User {
  person_id: number;
  name: string;
  first_surname: string;
  second_surname: string;
  email: string;
  role: UserRole;
  token: string; // JWT
}
