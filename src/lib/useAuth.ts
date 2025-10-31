// lib/useAuth.ts
import { useContext } from "react";
import { AuthContextType, AuthContext } from "./authContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
