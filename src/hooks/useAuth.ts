import { useContext } from "react";
import { AuthContext } from "@/lib/authContext";
import { AuthContextType } from "@/utils/types";

/**
 * Custom hook para acceder al contexto de autenticación.
 * Debe usarse dentro de un <AuthProvider>.
 *
 * @throws Error si se usa fuera del proveedor.
 * @returns {AuthContextType} Objeto con el estado y acciones de autenticación.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }

  return context;
}
