"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authMessages, notify } from "@/lib/notify";
import { syncSessionCookies } from "@/lib/session";
import type { RegisterFormValues } from "@/lib/validations/auth";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthResponse, RegisterPayload } from "@/types/auth";

export function useRegister() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation<AuthResponse, unknown, RegisterFormValues>({
    mutationFn: (formValues: RegisterFormValues) => {
      const payload: RegisterPayload = {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
      };

      if (formValues.phone && formValues.phone.trim().length > 0) {
        payload.phone = formValues.phone.trim();
      }

      if (formValues.address && formValues.address.trim().length > 0) {
        payload.address = formValues.address.trim();
      }

      return authService.register(payload);
    },
    meta: { skipToast: true },
    onSuccess: async (data) => {
      // 1. Store session in memory Zustand store
      setSession(data.user, data.accessToken);

      // 2. Synchronize frontend routing cookies
      await syncSessionCookies(
        data.accessToken,
        data.user.mustChangePassword,
        data.user.role,
      );

      // 3. User feedback
      const firstName = data.user.name ? data.user.name.split(" ")[0] : "there";
      const msg = authMessages.accountCreated(firstName);
      notify.success(msg.title, msg.description);

      // 4. Default registration lands on customer portal
      router.replace("/customer");
      router.refresh();
    },
    onError: (error) => {
      notify.fromError(error, "Registration failed");
    },
  });
}
