export async function createConcept(
  form: Record<string, unknown>,
  token: string
) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${API_URL}/catalogue/create-concept`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });

  if (!res.ok) throw new Error("No se pudo crear el concepto");

  return res.json();
}
