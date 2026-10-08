import { getQueryClient } from "@/lib/query-client";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/auth";

export interface RouterLike {
  push: (url: string) => void;
  replace: (url: string) => void;
  refresh?: () => void;
}

/**
 * Synchronizes session cookies via the Next.js /api/session route handler.
 * Uses native fetch to avoid axios interceptor recursion.
 */
export async function syncSessionCookies(
  accessToken: string,
  mustChangePassword?: boolean,
  role?: Role,
): Promise<{ role: Role } | null> {
  try {
    const res = await fetch("/api/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken, mustChangePassword, role }),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { role: Role };
    return data;
  } catch {
    return null;
  }
}

/**
 * Deletes all frontend routing session cookies.
 */
export async function clearSessionCookies(): Promise<void> {
  try {
    await fetch("/api/session", {
      method: "DELETE",
    });
  } catch {
    // Ignore network error during cookie deletion
  }
}

/**
 * Full logout flow:
 * 1. Calls backend logout to invalidate refresh token
 * 2. Clears frontend session cookies
 * 3. Resets Zustand memory store
 * 4. Wipes TanStack Query cache
 * 5. Navigates user to /login
 */
export async function performLogout(router?: RouterLike | null): Promise<void> {
  try {
    await authService.logoutRequest();
  } catch {
    // Ignore backend logout failures (e.g. if already expired)
  }

  await clearSessionCookies();
  useAuthStore.getState().logout();

  try {
    getQueryClient().clear();
  } catch {
    // Ignore cache clear error if query client not instantiated
  }

  if (router) {
    router.replace("/login");
    router.refresh?.();
  } else if (typeof window !== "undefined") {
    window.location.assign("/login");
  }
}
