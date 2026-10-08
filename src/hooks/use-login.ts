"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getSafeRedirect } from "@/lib/auth-routes";
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
    onSuccess: async (data) => {
      // 1. Update in-memory Zustand session
      setSession(data.user, data.accessToken);

      // 2. Synchronize HTTP cookies for Next.js routing
      await syncSessionCookies(data.accessToken, data.user.mustChangePassword);

      // 3. User feedback
      const firstName = data.user.name ? data.user.name.split(" ")[0] : "User";
      toast.success(`Welcome back, ${firstName}`);

      // 4. Role-aware redirection
      if (data.user.mustChangePassword) {
        router.replace("/change-password");
      } else {
        const redirectParam = searchParams.get("redirect");
        const targetUrl = getSafeRedirect(redirectParam, data.user.role);
        router.replace(targetUrl);
      }

      // 5. Refresh server components with new cookies
      router.refresh();
    },
  });
}
