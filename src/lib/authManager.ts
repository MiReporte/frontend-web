import { mockUsers } from "@/mocks/users";
import { User } from "@/utils/types";

/**
 * Key used to store authentication data in localStorage.
 * @constant
 */
const AUTH_KEY = "auth_data";

/**
 * Authentication manager responsible for handling user login, logout,
 * and session persistence in the browser's local storage.
 */
export const AuthManager = {
  /**
   * Logs in a user by verifying credentials against the mock user list.
   *
   * If the credentials are valid:
   * - Generates a simulated Base64 token.
   * - Stores the authenticated user's data (including the token) in localStorage.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {User | null} Returns the authenticated user object with a token if the credentials are valid, or `null` otherwise.
   */
  login(email: string, password: string): User | null {
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Simulate a token generation based on the user's person ID
      const token = btoa(JSON.stringify({ person_id: user.person_id }));

      // Add the token to the authenticated user object
      const userWithToken: User = { ...user, token };

      // Store session data in browser localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_KEY, JSON.stringify(userWithToken));
      }

      return userWithToken;
    }

    return null;
  },

  /**
   * Logs out the currently authenticated user.
   *
   * Removes all authentication data stored in localStorage.
   */
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_KEY);
    }
  },

  /**
   * Retrieves the currently authenticated user's data from localStorage.
   * @returns {User | null} Returns the stored user object if available, or `null` if there is no active session.
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },
};
