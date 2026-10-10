"use client";

import axios from "axios";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { publicEnv } from "@/lib/env";
import { clearSessionCookies } from "@/lib/session";
import { FS_COOKIE_HINT } from "@/lib/session-cookies";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import type { RefreshTokenResponse, User } from "@/types/auth";

interface AuthContextValue {
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  retry: () => {},
});

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const isRunningRef = useRef(false);
  const setSession = useAuthStore((state) => state.setSession);
  const setStatus = useAuthStore((state) => state.setStatus);

  const initializeAuth = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    // Check for session hint cookie before making unnecessary requests for anonymous visitors
    if (typeof document !== "undefined") {
      const hasSessionHint = document.cookie
        .split(";")
        .some((c) => c.trim().startsWith(`${FS_COOKIE_HINT}=1`));

      if (!hasSessionHint) {
        setStatus("unauthenticated");
        isRunningRef.current = false;
        return;
      }
    }

    setStatus("loading");
    const baseURL = publicEnv.apiBase;

    try {
      // Step 1: Silent refresh token exchange via httpOnly cookie (60s timeout for cold Render server)
      const refreshRes = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true, timeout: 60000 },
      );

      const accessToken = refreshRes.data?.data?.accessToken;
      if (!accessToken) {
        useAuthStore.getState().logout();
        await clearSessionCookies();
        setStatus("unauthenticated");
        isRunningRef.current = false;
        return;
      }

      // Step 2: Fetch current user profile using the new access token (60s timeout)
      const meRes = await axios.get<ApiResponse<User>>(`${baseURL}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
        timeout: 60000,
      });

      const user = meRes.data?.data;
      if (user) {
        setSession(user, accessToken);
      } else {
        useAuthStore.getState().logout();
        await clearSessionCookies();
        setStatus("unauthenticated");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        // 401 or 403 means the session is genuinely invalid
        if (status === 401 || status === 403) {
          useAuthStore.getState().logout();
          await clearSessionCookies();
          setStatus("unauthenticated");
          return;
        }
      }
      // A network error, timeout (ECONNABORTED), or 5xx indicates an unreachable/slow server
      // Do NOT clear cookies and do NOT log out.
      setStatus("unreachable");
    } finally {
      isRunningRef.current = false;
    }
  }, [setSession, setStatus]);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    // If user is already authenticated in store (e.g. from login mutation), skip silent refresh
    if (
      useAuthStore.getState().status === "authenticated" &&
      useAuthStore.getState().user
    ) {
      return;
    }

    initializeAuth();
  }, [initializeAuth]);

  return (
    <AuthContext.Provider value={{ retry: initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
