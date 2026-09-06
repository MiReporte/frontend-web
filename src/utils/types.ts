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
  neighborhood?: string | null;
  description: string;
  evidence: string;
  evidence1?: string;
  evidence2?: string | null;
  evidence3?: string | null;
  evidences?: string[];
  assigned_supervisor: number | null;
  reporting_user: number | null;
  typereport: string;
  asunto?: string | null;
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
  evidence1?: string;
  evidence2?: string | null;
  evidence3?: string | null;
  evidences?: string[];
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

export interface ReportMapPoint {
  report_id: number;
  latitude: number;
  longitude: number;
  typereport: "BACHE" | "ALUM" | string;
  status: string;
  date: string | null;
  problem: string | null;
  neighborhood: string;
}

// Define las interfaces para la respuesta del endpoint /reports/statistics

export interface ReportStatistics {
  by_status: {
    APROBADO: number;
    CIERRE: number;
    COMPLETADO: number;
    "NO APROBADO": number;
    PROCESO: number;
    REVISION: number;
    [key: string]: number; // Para manejar otros posibles estados
  };
  by_type: {
    ALUM: number;
    BACHE: number;
    [key: string]: number; // Para manejar otros posibles tipos
  };
  total_reports: number;
}
// Define el tipo para el filtro de rango de tiempo (debe coincidir con el endpoint)
export type TimeRangeFilter =
  | "hoy"
  | "ultima_semana"
  | "ultimo_mes"
  | "ultimos_seis_meses"
  | "ultimo_anio"
  | "todo_el_tiempo";

export type TimeRangeFilterState = TimeRangeFilter | null;

export interface ReportCountByDay {
  domingo: number;
  lunes: number;
  martes: number;
  miercoles: number;
  jueves: number;
  viernes: number;
  sabado: number;
  [key: string]: number; // Permite manejar cualquier clave de día
}

export interface NotificationItem {
  id?: number | string;
  type: string;
  message: string;
  is_read: boolean;
  date: string;
  report_id?: number | null;
}

export interface NewReportSocketPayload {
  notification: {
    type: string;
    message: string;
    is_read: boolean;
    date: string;
    report_id: number;
  };
  report: {
    report_id: number;
    typereport: string;
    status: string;
    date: string;
    latitude: number;
    longitude: number;
    reporting_user?: number;
  };
}

export interface UnreadNotificationsCountResponse {
  unread_count: number;
}

export interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  lastReportEvent: NewReportSocketPayload | null;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

