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

  // Prevent protocol-relative URLs or open redirects (must start with "/" and not "//")
  if (!redirectParam.startsWith("/") || redirectParam.startsWith("//")) {
    return roleHome;
  }

  // Must begin with the role's authorized path prefix
  if (redirectParam === roleHome || redirectParam.startsWith(`${roleHome}/`)) {
    return redirectParam;
  }

  return roleHome;
}
