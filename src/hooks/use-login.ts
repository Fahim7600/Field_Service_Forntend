"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { getSafeRedirect } from "@/lib/auth-routes";
import { authMessages, notify } from "@/lib/notify";
import { getSafeRedirect as sanitizeRedirect } from "@/lib/safe-redirect";
import { syncSessionCookies } from "@/lib/session";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse, LoginPayload } from "@/types/auth";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<AuthResponse, unknown, LoginPayload>({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    meta: { skipToast: true },
    onSuccess: async (data) => {
      // 1. Update in-memory Zustand session
      setSession(data.user, data.accessToken);

      // 2. Synchronize HTTP cookies for Next.js routing with role passed explicitly
      await syncSessionCookies(
        data.accessToken,
        data.user.mustChangePassword,
        data.user.role,
      );

      // 3. User feedback
      const firstName = data.user.name ? data.user.name.split(" ")[0] : "User";
      const msg = authMessages.welcomeBack(firstName);
      notify.success(msg.title, msg.description);

      // 4. Role-aware redirection
      if (data.user.mustChangePassword) {
        router.replace("/change-password");
      } else {
        const redirectParam = searchParams.get("redirect");
        const safeParam = sanitizeRedirect(redirectParam, "");
        const targetUrl = getSafeRedirect(safeParam, data.user.role);
        router.replace(targetUrl);
      }

      // 5. Refresh server components with new cookies
      router.refresh();
    },
    onError: (error) => {
      notify.fromError(error, "Login failed");
    },
  });
}
