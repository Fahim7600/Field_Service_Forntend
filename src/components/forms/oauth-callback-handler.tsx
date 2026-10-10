"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_HOME } from "@/lib/auth-routes";
import { notify } from "@/lib/notify";
import { clearSessionCookies, syncSessionCookies } from "@/lib/session";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) {
      return;
    }
    processed.current = true;

    async function handleCallback() {
      const token =
        searchParams.get("token") || searchParams.get("accessToken");
      const errorParam = searchParams.get("error");

      if (errorParam || !token) {
        notify.error("Google sign-in failed", "Please try again.", {
          id: "google-auth-error",
        });
        router.replace("/login");
        return;
      }

      // 1. Immediately remove access token from browser URL address bar and history
      if (typeof window !== "undefined") {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }

      try {
        // 2. Set token in memory
        setAccessToken(token);

        // 3. Fetch user profile
        const user = await authService.fetchMe();

        // 4. Set complete session
        setSession(user, token);

        // 5. Synchronize routing cookies with user role
        await syncSessionCookies(token, user.mustChangePassword, user.role);

        // 6. User feedback & redirection
        notify.success(
          "Signed in with Google",
          "You have successfully signed in.",
          {
            id: "google-auth-success",
          },
        );

        const target = ROLE_HOME[user.role] || "/";
        router.replace(target);
        router.refresh();
      } catch {
        await clearSessionCookies();
        useAuthStore.getState().logout();
        notify.error("Google sign-in failed", "Please try again.", {
          id: "google-auth-error",
        });
        router.replace("/login");
      }
    }

    handleCallback();
  }, [searchParams, router, setAccessToken, setSession]);

  return (
    <Card className="bg-card w-full rounded-2xl p-8 border border-border shadow-xs text-center space-y-4">
      <CardContent className="p-0 space-y-4">
        <div className="size-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-charcoal-900">
            Signing you in...
          </h2>
          <p className="text-xs text-charcoal-600">
            Verifying your Google authentication credentials.
          </p>
        </div>
        <div className="pt-2 space-y-2 max-w-xs mx-auto">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
