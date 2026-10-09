/**
 * Next.js Edge Middleware for Role-Based Access Control and Route Protection
 *
 * Evaluation Rules Order:
 * 1. Forced Password Change: If `fs_must_change === "1"` and user accesses protected
 *    dashboards (/admin, /customer, /technician) or auth pages (/login, /register),
 *    redirect directly to `/change-password`.
 * 2. Change Password Guard (/change-password):
 *    - Anonymous users (no `fs_role` cookie) are redirected to `/login?redirect=%2Fchange-password`.
 *    - Authenticated users (with `fs_role`) are allowed (supports both forced & voluntary changes).
 * 3. Guest Auth Pages (/login, /register):
 *    - Authenticated users with an active role session are redirected to their role home.
 * 4. Protected Role Dashboards (/admin, /technician, /customer):
 *    - Unauthenticated requests are redirected to `/login?redirect={encodedPath}`.
 *    - Authenticated requests with mismatched roles are redirected to their appropriate
 *      role dashboard with `?role_redirect=1`.
 */

import { type NextRequest, NextResponse } from "next/server";
import { FS_COOKIE_MUST_CHANGE, FS_COOKIE_ROLE } from "@/lib/session-cookies";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin",
  TECHNICIAN: "/technician",
  CUSTOMER: "/customer",
};

const PATH_ROLE_MAP: Record<string, string> = {
  admin: "ADMIN",
  technician: "TECHNICIAN",
  customer: "CUSTOMER",
};

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const roleCookie = req.cookies.get(FS_COOKIE_ROLE)?.value;
  const mustChangeCookie = req.cookies.get(FS_COOKIE_MUST_CHANGE)?.value;

  const role = roleCookie ? roleCookie.toUpperCase() : undefined;
  const mustChangePassword = mustChangeCookie === "1";

  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  const isDashboardRoute = firstSegment && Boolean(PATH_ROLE_MAP[firstSegment]);
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isChangePasswordRoute = pathname === "/change-password";

  // 1. Enforce forced password change: redirect to /change-password
  if (mustChangePassword) {
    if (isDashboardRoute || isAuthRoute) {
      const changePasswordUrl = new URL("/change-password", req.url);
      return NextResponse.redirect(changePasswordUrl);
    }
  }

  // 2. Guard /change-password route
  if (isChangePasswordRoute) {
    if (!role) {
      const loginUrl = new URL("/login?redirect=%2Fchange-password", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Guest Auth Pages (/login, /register)
  if (isAuthRoute) {
    if (role && ROLE_HOME[role]) {
      const redirectUrl = new URL(ROLE_HOME[role], req.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 4. Protected Dashboard Routes (/admin, /technician, /customer)
  if (isDashboardRoute) {
    const requiredRole = PATH_ROLE_MAP[firstSegment];

    // If no role cookie exists, redirect to login with encoded redirect param
    if (!role) {
      const fullPath = pathname + search;
      const encodedRedirect = encodeURIComponent(fullPath);
      const loginUrl = new URL(`/login?redirect=${encodedRedirect}`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If role cookie exists but does not match the route's role area, redirect to correct home
    if (role !== requiredRole) {
      const roleHome = ROLE_HOME[role] || "/customer";
      const redirectUrl = new URL(`${roleHome}?role_redirect=1`, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/technician/:path*",
    "/customer/:path*",
    "/change-password",
    "/login",
    "/register",
  ],
};
