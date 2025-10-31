// lib/authContext.tsx
"use client";

import { createContext, useState, ReactNode, useContext } from "react";
import { AuthManager } from "@/lib/authManager";
import { User } from "@/utils/types";

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() =>
    typeof window !== "undefined" ? AuthManager.getUser() : null
  );

  const login = (email: string, password: string) => {
    const loggedUser = AuthManager.login(email, password);
    if (loggedUser) {
      if (loggedUser.role === "usuario_ciudadano") {
        AuthManager.logout();
        return false;
      }
      setUser(loggedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    AuthManager.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
