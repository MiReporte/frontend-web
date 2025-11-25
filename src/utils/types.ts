export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: number;
  user: {
    person_id: number;
    image: string | null;
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
  image: string | null;
  expiration: number;
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

export interface UpdateStateBody {
  report_id: number;
  status: string;
}

export interface UpdateStateResponse {
  message: string;
}

export interface SupervisorsResponse {
  first_surname: string;
  image: string | null;
  name: string;
  account_id: number;
  counted_reports: number;
  role: string;
  second_surname: string;
}

export interface UpdateSupervisorReportBody {
  report_id: number;
  assigned_supervisor: number;
}

export interface UpdateSupervisorReportResponse {
  message: string;
}

export interface GetReportByIdResponse {
  assigned_supervisor: number;
  asunto: string;
  date: string;
  description: string;
  evidence: string;
  latitude: number;
  longitude: number;
  report_id: number;
  reporting_user: number;
  status: string;
  typereport: string;
}
