export const FS_COOKIE_ROLE = "fs_role";
export const FS_COOKIE_HINT = "fs_hint";
export const FS_COOKIE_MUST_CHANGE = "fs_must_change";

export const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface SessionCookieOptions {
  path: string;
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  maxAge: number;
  httpOnly: boolean;
}

export function getSessionCookieOptions(httpOnly = true): SessionCookieOptions {
  return {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_COOKIE_MAX_AGE,
    httpOnly,
  };
}
