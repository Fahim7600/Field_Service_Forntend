import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  FS_COOKIE_HINT,
  FS_COOKIE_MUST_CHANGE,
  FS_COOKIE_ROLE,
  getSessionCookieOptions,
} from "@/lib/session-cookies";
import type { ApiResponse } from "@/types/api";
import type { User } from "@/types/auth";

const sessionPayloadSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  mustChangePassword: z.boolean().optional(),
});

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

    const { accessToken, mustChangePassword } = parseResult.data;

    // Verify the access token directly with the backend
    const backendBase =
      process.env.BACKEND_URL || "https://field-service-d24g.onrender.com";

    const verifyRes = await fetch(`${backendBase}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!verifyRes.ok) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired access token" },
        { status: 401 },
      );
    }

    const json = (await verifyRes.json()) as ApiResponse<User>;
    const user = json?.data;

    if (!user || !user.role) {
      return NextResponse.json(
        { success: false, message: "User profile could not be verified" },
        { status: 401 },
      );
    }

    // Set routing cookies on the frontend origin
    const cookieStore = await cookies();

    // 1. fs_role (httpOnly)
    cookieStore.set(FS_COOKIE_ROLE, user.role, getSessionCookieOptions(true));

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

    return NextResponse.json({ role: user.role });
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
