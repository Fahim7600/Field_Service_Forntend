import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBackendUrl } from "@/lib/server-env";
import {
  FS_COOKIE_HINT,
  FS_COOKIE_MUST_CHANGE,
  FS_COOKIE_ROLE,
  getSessionCookieOptions,
} from "@/lib/session-cookies";
import type { ApiResponse } from "@/types/api";
import type { Role, User } from "@/types/auth";

const sessionPayloadSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  mustChangePassword: z.boolean().optional(),
  role: z.enum(["CUSTOMER", "TECHNICIAN", "ADMIN"]).optional(),
});

function decodeJwtRole(token: string): Role | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    const parsed = JSON.parse(jsonStr) as { role?: string };
    const rawRole = parsed.role?.toUpperCase();
    if (
      rawRole === "ADMIN" ||
      rawRole === "TECHNICIAN" ||
      rawRole === "CUSTOMER"
    ) {
      return rawRole as Role;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody: unknown = await request.json();
    const parseResult = sessionPayloadSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid session payload",
          errors: parseResult.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      accessToken,
      mustChangePassword,
      role: payloadRole,
    } = parseResult.data;

    // Determine verified role: from payload role, JWT token decoding, or backend call
    let verifiedRole: Role | null = payloadRole || decodeJwtRole(accessToken);

    if (!verifiedRole) {
      try {
        const backendBase = getBackendUrl();

        const verifyRes = await fetch(`${backendBase}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (verifyRes.ok) {
          const json = (await verifyRes.json()) as ApiResponse<User>;
          if (json?.data?.role) {
            verifiedRole = json.data.role;
          }
        }
      } catch {
        // Fallback to token decoded role if backend verification fails
      }
    }

    if (!verifiedRole) {
      return NextResponse.json(
        { success: false, message: "User profile could not be verified" },
        { status: 401 },
      );
    }

    // Set routing cookies on the frontend origin
    const cookieStore = await cookies();

    // 1. fs_role (httpOnly)
    cookieStore.set(
      FS_COOKIE_ROLE,
      verifiedRole,
      getSessionCookieOptions(true),
    );

    // 2. fs_hint = "1" (accessible to client-side JS)
    cookieStore.set(FS_COOKIE_HINT, "1", getSessionCookieOptions(false));

    // 3. fs_must_change = "1" (httpOnly, set only if mustChangePassword is true)
    if (mustChangePassword) {
      cookieStore.set(
        FS_COOKIE_MUST_CHANGE,
        "1",
        getSessionCookieOptions(true),
      );
    } else {
      cookieStore.delete(FS_COOKIE_MUST_CHANGE);
    }

    return NextResponse.json({ role: verifiedRole });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal session synchronization error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.delete(FS_COOKIE_ROLE);
  cookieStore.delete(FS_COOKIE_HINT);
  cookieStore.delete(FS_COOKIE_MUST_CHANGE);

  return new NextResponse(null, { status: 204 });
}
