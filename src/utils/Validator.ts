/**
 * Validate an e-mail.
 *
 * @param email Dirección de correo electrónico a validar.
 * @returns An error message if the email is invalid, or 'null' if it is valid.
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return "El campo de correo no puede estar vacío";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "El correo no tiene un formato válido";
  }
  return null;
}

/**
 * Validate a password.
 *
 * @param password - Password to validate.
 * @returns An error message if the password does not meet the requirements, or 'null' if it is valid.
 */
export function validatePassword(password: string): string | null {
  if (!password.trim()) {
    return "El campo de contraseña no puede estar vacío";
  }
  if (password.length < 1) {
    return "La contraseña debe tener al menos 6 caracteres";
  }
  if (password.length > 14) {
    return "La contraseña debe tener menos de 14 caracteres";
  }
  return null;
}
