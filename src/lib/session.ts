import { publicEnv } from "@/lib/env";
import { getQueryClient } from "@/lib/query-client";
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
 * Deletes all frontend routing session cookies with a 2-second timeout.
 */
export async function clearSessionCookies(): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    await fetch("/api/session", {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch {
    // Ignore network error or abort during cookie deletion
  }
}

let isLoggingOut = false;

/**
 * Instant, safe logout flow:
 * 1. Read the access token from the auth store (needed for background revoke)
 * 2. Fire backend revocation WITHOUT awaiting it (keepalive: true allows completing after unload)
 * 3. Clear local state immediately: Zustand auth store, TanStack Query cache, sessionStorage
 * 4. Clear frontend routing cookies (fs_role, fs_hint, fs_must_change) with a 2s AbortController
 * 5. Navigate with a HARD navigation to /login?reason=logged_out to prevent stale router state
 */
export async function performLogout(
  _router?: RouterLike | null,
): Promise<void> {
  if (isLoggingOut) {
    return;
  }
  isLoggingOut = true;

  try {
    // 1. Read token before clearing store
    const token = useAuthStore.getState().accessToken;

    // 2. Fire backend revocation in the background without awaiting it
    const baseURL = publicEnv.apiBase;
    try {
      void fetch(`${baseURL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        keepalive: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => {
        // Ignore background revoke errors
      });
    } catch {
      // Ignore synchronous fetch dispatch error
    }

    // 3. Clear local state immediately
    useAuthStore.getState().logout();

    try {
      getQueryClient().clear();
    } catch {
      // Ignore cache clear error
    }

    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.clear();
      }
    } catch {
      // Ignore sessionStorage clear error
    }

    // 4. Clear routing cookies with 2-second timeout
    await clearSessionCookies();

    // 5. Hard navigation to clean up all client states
    if (typeof window !== "undefined") {
      window.location.assign("/login?reason=logged_out");
    }
  } finally {
    // Guard will stay active until page unloads, but reset in case navigation was cancelled
    setTimeout(() => {
      isLoggingOut = false;
    }, 5000);
  }
}
