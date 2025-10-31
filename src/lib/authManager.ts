// services/authManager.ts
import { mockUsers } from "@/mocks/users";
import { User } from "@/utils/types";

const AUTH_KEY = "auth_data";

export const AuthManager = {
  login(email: string, password: string): User | null {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      // Generar JWT simulado (en producción, esto vendría del backend)
      const token = btoa(JSON.stringify({ person_id: user.person_id }));

      const userWithToken: User = { ...user, token };
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithToken));
      }
      return userWithToken;
    }
    return null;
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },
};
