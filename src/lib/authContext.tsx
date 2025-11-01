"use client";

import { createContext, useState, ReactNode } from "react";
import { AuthManager } from "@/lib/authManager";
import { User } from "@/utils/types";

/**
 * Context of authentication to manage user login state across the application.
 */
export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
};

/**
 * Creation of the AuthContext with default undefined value.
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 *
 * @param children - The child components that will have access to the authentication context.
 * @returns The AuthProvider component that wraps around children components to provide authentication context.
 */
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
