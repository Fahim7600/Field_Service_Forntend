"use client";

import axios from "axios";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse } from "@/types/api";
import type { RefreshTokenResponse, User } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const setSession = useAuthStore((state) => state.setSession);
  const setStatus = useAuthStore((state) => state.setStatus);

  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;

    async function initializeAuth() {
      setStatus("loading");
      const baseURL = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

      try {
        // Step 1: Silent refresh token exchange via httpOnly cookie
        const refreshRes = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true, timeout: 10000 },
        );

        const accessToken = refreshRes.data?.data?.accessToken;
        if (!accessToken) {
          setStatus("unauthenticated");
          return;
        }

        // Step 2: Fetch current user profile using the new access token
        const meRes = await axios.get<ApiResponse<User>>(
          `${baseURL}/users/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
            timeout: 10000,
          },
        );

        const user = meRes.data?.data;
        if (user) {
          setSession(user, accessToken);
        } else {
          setStatus("unauthenticated");
        }
      } catch {
        // Silent failure on startup without toast
        setStatus("unauthenticated");
      }
    }

    initializeAuth();
  }, [setSession, setStatus]);

  return <>{children}</>;
}
