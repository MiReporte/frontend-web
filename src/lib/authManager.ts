import { User, LoginCredentials, LoginResponse } from "@/utils/types";

const AUTH_KEY = "auth_data";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Manager of authentication-related operations such as login, logout, and retrieving user data.
 */
export const AuthManager = {
  /**
   * Attempts to log in a user with the provided email and password.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} The logged-in user's data.
   * @throws {Error} If the login fails due to incorrect credentials or server issues.
   **/
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/account/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password } satisfies LoginCredentials),
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "No se pudo iniciar sesión. Correo o contraseña incorrectos."
          );
        } else if (response.status >= 500) {
          throw new Error("Error interno del servidor. Intenta más tarde.");
        } else {
          throw new Error(
            errorText || `Error al iniciar sesión (${response.status})`
          );
        }
      }

      const data = (await response.json()) as LoginResponse;

      const user: User = {
        token: data.token,
        expiration: data.expiration,
        image: data.user.image,
        name: data.user.name,
        first_surname: data.user.first_surname,
        second_surname: data.user.second_surname,
        email: data.user.email,
        role: data.user.role as User["role"],
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error during login:", error.message);
        throw new Error(error.message || "Error desconocido durante el login.");
      }

      console.error("Unknown error during login:", error);
      throw new Error("Error inesperado durante el login.");
    }
  },

  /**
   * Closes the current user session by removing the user's data from localStorage.
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  /**
   * Retrieves the currently logged-in user's data from localStorage.
   * @returns {User | null} The user's data or null if no user is logged in.
   * Automatically logs out the user if the token has expired.
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;

    const user = JSON.parse(data) as User;

    const now = Math.floor(Date.now() / 1000);
    if (user.expiration && now > user.expiration) {
      console.warn("Token expirado, cerrando sesión automáticamente.");
      this.logout();
      return null;
    }

    return user;
  },
};
