"use client";

import { createContext, useState, ReactNode } from "react";
import { AuthManager } from "@/lib/authManager";
import { User, AuthContextType } from "@/utils/types";

/**
 * Create the authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/**
 * Provider component that wraps the app and makes auth object available to any child component that calls useAuth().
 *
 * @param children - The child components that will have access to the auth context.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() =>
    typeof window !== "undefined" ? AuthManager.getUser() : null
  );

  /**
   * Login function that authenticates the user and updates the global state.
   *
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns {Promise<boolean>} True if login is successful, false otherwise.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const loggedUser = await AuthManager.login(email, password);

      if (loggedUser.role === "Usuario ciudadano") {
        AuthManager.logout();
        return false;
      }

      setUser(loggedUser);
      return true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error en login:", error.message);
      } else {
        console.error("Error desconocido en login:", error);
      }

      AuthManager.logout();
      setUser(null);
      return false;
    }
  };

  /**
   * Logout function that clears the user from global state.
   */
  const logout = (): void => {
    AuthManager.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
