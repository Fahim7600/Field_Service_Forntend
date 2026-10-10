/**
 * Public environment configuration accessible by both client and server components.
 * Trailing slashes are stripped to ensure consistent URL composition.
 */
function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const rawApiBase = process.env.NEXT_PUBLIC_API_BASE?.trim();

export const publicEnv = {
  appUrl: rawAppUrl ? stripTrailingSlash(rawAppUrl) : "http://localhost:3000",
  apiBase: rawApiBase ? stripTrailingSlash(rawApiBase) : "/api/v1",
} as const;
