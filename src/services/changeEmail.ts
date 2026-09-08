import {
  EmailChangeRequestBody,
  EmailChangeRequestResponse,
  EmailChangeConfirmBody,
  EmailChangeConfirmResponse,
} from "@/utils/types";

/**
 * Requests an email change. Sends a verification code to the user's current email.
 *
 * @param token - JWT access token.
 * @param body - Object containing the new_email.
 * @returns The success message and a verification_token for the confirmation step.
 */
export async function requestEmailChange(
  token: string,
  body: EmailChangeRequestBody
): Promise<EmailChangeRequestResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/email-change-request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || "Error al solicitar el cambio de correo"
    );
  }

  return response.json();
}

/**
 * Confirms an email change with the verification code and token.
 *
 * @param token - JWT access token (session token).
 * @param body - Object containing verification_token and code.
 * @returns The success message and the new_email.
 */
export async function confirmEmailChange(
  token: string,
  body: EmailChangeConfirmBody
): Promise<EmailChangeConfirmResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/account/email-change-confirm`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.error || "Error al confirmar el cambio de correo"
    );
  }

  return response.json();
}
