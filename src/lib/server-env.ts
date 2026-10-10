import "server-only";

/**
 * Server-only environment configuration.
 * Reads BACKEND_URL, trims any trailing slash, and throws a runtime Error if unset.
 */
export function getBackendUrl(): string {
  const raw = process.env.BACKEND_URL?.trim();

  if (!raw) {
    throw new Error("BACKEND_URL is not set");
  }

  return raw.replace(/\/+$/, "");
}
