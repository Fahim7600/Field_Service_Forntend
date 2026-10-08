"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { clearSessionCookies } from "@/lib/session";
import type { ChangePasswordFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ChangePasswordPayload } from "@/types/auth";

export function useChangePassword() {
  const router = useRouter();

  return useMutation<null, unknown, ChangePasswordFormValues>({
    mutationFn: (formValues: ChangePasswordFormValues) => {
      const payload: ChangePasswordPayload = {
        oldPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      };

      return authService.changePassword(payload);
    },
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

      // 3. Redirect to login with passwordChanged param
      router.replace("/login?passwordChanged=1");
      router.refresh();
    },
  });
}
