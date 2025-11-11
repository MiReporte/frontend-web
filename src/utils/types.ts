export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: number;
  user: {
    person_id: number;
    name: string;
    first_surname: string;
    second_surname: string;
    email: string;
    role: string;
  };
}

export interface User {
  token: string;
  name: string;
  first_surname: string;
  second_surname: string;
  email: string;
  role: UserRole;
}

export type UserRole =
  | "Administrador"
  | "Mesa de servicios"
  | "Supervisor tecnico"
  | "Usuario ciudadano";

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoggedIn: boolean;
};

export interface ResponseReports {
  report_id: number;
  date: string;
  status: string;
  latitude: number;
  longitude: number;
  description: string;
  evidence: string;
  assigned_supervisor: number | null;
  reporting_user: number | null;
  typereport: string;
}

export interface PaginatedResponse {
  items: ResponseReports[];
  limit: number;
  page: number;
  totalItems: number;
  totalPages: number;
}
