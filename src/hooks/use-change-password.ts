"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notify";
import { getQueryClient } from "@/lib/query-client";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { clearSessionCookies } from "@/lib/session";
import type { ChangePasswordFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ChangePasswordPayload } from "@/types/auth";

export function useChangePassword() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation<null, unknown, ChangePasswordFormValues>({
    mutationFn: (formValues: ChangePasswordFormValues) => {
      const payload: ChangePasswordPayload = {
        oldPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      };

      return authService.changePassword(payload);
    },
    meta: { skipToast: true },
    onSuccess: async () => {
      // 1. Wipe session cookies and in-memory store
      await clearSessionCookies();
      useAuthStore.getState().logout();

      // 2. Clear query cache
      try {
        getQueryClient().clear();
      } catch {
        // Ignore cache clear errors
      }

      // 3. Redirect to login with reason=password_changed param and preserved safe redirect if present
      const redirectParam = searchParams.get("redirect");
      const safeRedirect = redirectParam
        ? getSafeRedirect(redirectParam, "")
        : "";
      const loginUrl = safeRedirect
        ? `/login?reason=password_changed&redirect=${encodeURIComponent(safeRedirect)}`
        : "/login?reason=password_changed";

      router.replace(loginUrl);
      router.refresh();
    },
    onError: (error) => {
      notify.fromError(error, "Failed to update password");
    },
  });
}
