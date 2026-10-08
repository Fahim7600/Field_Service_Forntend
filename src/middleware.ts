import { type NextRequest, NextResponse } from "next/server";
import { FS_COOKIE_ROLE } from "@/lib/session-cookies";

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
  const role = roleCookie ? roleCookie.toUpperCase() : undefined;

  // 1. If path is /login or /register and user already has an active role session:
  if (pathname === "/login" || pathname === "/register") {
    if (role && ROLE_HOME[role]) {
      const redirectUrl = new URL(ROLE_HOME[role], req.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 2. Protected dashboard routes (/admin, /technician, /customer)
  const firstSegment = pathname.split("/")[1]?.toLowerCase();
  const requiredRole = firstSegment ? PATH_ROLE_MAP[firstSegment] : undefined;

  if (requiredRole) {
    // If no role cookie exists, redirect to login with encoded redirect param
    if (!role) {
      const fullPath = pathname + search;
      const encodedRedirect = encodeURIComponent(fullPath);
      const loginUrl = new URL(`/login?redirect=${encodedRedirect}`, req.url);
      return NextResponse.redirect(loginUrl);
    }

    // If role cookie exists but does not match the route's role area, redirect to correct home with role_redirect=1
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
    "/login",
    "/register",
  ],
};
