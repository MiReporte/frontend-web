export async function changePassword(
  new_password: string,
  reset_token: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account/reset-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          new_password,
          reset_token,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.msg || "Error al cambiar la contraseña");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("changePassword error:", error);
    return null;
  }
}
