// services/userService.ts
import { mockUsers } from "@/mocks/completeUsers";
import { User } from "@/utils/types";
// Indica si usar mocks o API real
const USE_MOCK = true;

// Función para obtener usuario por person_id (de JWT)
export async function getUserById(jwt: string): Promise<User | null> {
  // Extraemos person_id del JWT
  const payload = parseJwt(jwt);
  const userId = payload?.person_id;
  if (!userId) return null;

  if (USE_MOCK) {
    // Usando los mocks
    return mockUsers.find((u) => u.person_id === userId) || null;
  } else {
    // Usando fetch a tu endpoint real
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!res.ok) throw new Error("Error fetching user");
      const data: User = await res.json();
      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }
}

// Función simple para decodificar JWT (solo payload)
function parseJwt(token: string): { person_id?: number } | null {
  try {
    const base64Payload = token.split(".")[1];
    const payload =
      typeof window === "undefined"
        ? Buffer.from(base64Payload, "base64").toString("utf-8") // Node
        : atob(base64Payload); // Navegador
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
