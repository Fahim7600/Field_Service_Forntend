const SESSION_ID_REGEX = /^cs_(test|live)_[A-Za-z0-9_]{10,200}$/;

/**
 * Validates and parses a Stripe Checkout Session ID from query parameters or user input.
 *
 * @param value - Raw input string (e.g. from searchParams).
 * @returns The sanitized session ID string if valid, otherwise null.
 */
export function parseSessionId(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (SESSION_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  return null;
}
