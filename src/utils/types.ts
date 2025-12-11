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
  name_report_user: string;
  first_surname_report_user: string;
  second_surname_report_user: string;

  status_history: {
    [key: string]: string;
  };
}

export interface AccountItem {
  account_id: number;
  account_status: "ACTIVE" | "DESACTIVATED";
  first_surname: string;
  second_surname: string;
  email: string;
  image: string;
  name: string;
  role: string;
}

export interface AccountsResponse {
  mesa_servicios: AccountItem[];
  supervisors: AccountItem[];
}

export interface EditStaffBody {
  name?: string;
  first_surname?: string;
  second_surname?: string;
  email?: string;
  role?: string;
  image?: string | null;
}

export interface EditStaffResponse {
  message: string;
}

export interface NewStaffBody {
  email: string;
  first_surname: string;
  name: string;
  password: string;
  role: string;
  second_surname: string;
}

export interface NewStaffResponse {
  message: string;
}

export interface CiudadanoItem {
  account_id: number;
  email: string;
  first_surname: string;
  image: string | null;
  name: string;
  registration_date: string;
  second_surname: string;
}

export interface CiudadanosResponse {
  items: CiudadanoItem[];
  limit: number;
  page: number;
  total_pages: number;
}

export interface ReportItem {
  asunto: string;
  date: string;
  description: string;
  evidence: string;
  latitude: number;
  longitude: number;
  relation_type: string;
  report_id: number;
  status: string;
  typereport: string;
}

export interface UserReportsResponse {
  items: ReportItem[];
  limit: number;
  page: number;
  total_pages: number;
}

export interface ReportStatistics {
  by_status: {
    APROBADO: number;
    CIERRE: number;
    COMPLETADO: number;
    "NO APROBADO": number;
    PROCESO: number;
    REVISION: number;
    [key: string]: number;
  };
  by_type: {
    ALUM: number;
    BACHE: number;
    [key: string]: number;
  };
  total_reports: number;
}

export interface NeighborhoodReportCount {
  neighborhood: string;
  reports_counted: number;
}
