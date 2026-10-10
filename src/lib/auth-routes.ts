import { getSafeRedirect as getSanitizedRedirect } from "@/lib/safe-redirect";
import type { Role } from "@/types/auth";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TECHNICIAN: "/technician",
  CUSTOMER: "/customer",
};

/**
 * Validates and returns a safe redirection path for the user's role.
 * Prevents open redirect attacks by ensuring the target starts with a single '/'
 * and is strictly scoped to the user's role dashboard space.
 */
export function getSafeRedirect(
  redirectParam: string | null | undefined,
  role: Role,
): string {
  const roleHome = ROLE_HOME[role] || "/";

  if (!redirectParam) {
    return roleHome;
  }

  const safe = getSanitizedRedirect(redirectParam, roleHome);
  if (safe === roleHome || safe.startsWith(`${roleHome}/`)) {
    return safe;
  }

  return roleHome;
}
