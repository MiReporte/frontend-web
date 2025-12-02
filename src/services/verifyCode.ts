export async function verifyCode(code: string, verification_token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account/recover-verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          verification_token,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.msg || "Código incorrecto o token inválido.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("VerifyCode error:", error);
    return null;
  }
}
