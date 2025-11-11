/**
 * Extract a user-friendly error message from various error types.
 * @param error - The error object to extract the message from.
 * @returns A string representing the error message.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  // If the error is an object with a message property
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: string }).message;
    return message ?? "Unknown error";
  }

  return "Unknown error";
}
