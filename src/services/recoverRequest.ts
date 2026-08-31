export async function recoverRequest(email: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account/recover-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        error: errorData?.msg || "No se pudo procesar la solicitud.",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("RecoverRequest error:", error);
    return { error: "Error de conexión. Inténtalo de nuevo." };
  }
}
