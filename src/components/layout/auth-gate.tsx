"use client";

import { AlertCircle, Loader2, LogOut, RefreshCw } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_HOME } from "@/lib/auth-routes";
import { authMessages, notify } from "@/lib/notify";
import { getSafeRedirect } from "@/lib/safe-redirect";
import { clearSessionCookies, performLogout } from "@/lib/session";
import { useAuthContext } from "@/providers/auth-provider";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/auth";

export interface AuthGateProps {
  role: Role;
  children: React.ReactNode;
}

export function AuthGate({ role, children }: AuthGateProps) {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const { retry } = useAuthContext();
  const [slowServerNotice, setSlowServerNotice] = useState(false);

  // After 5s of loading or idle, display waking line and notify.info toast
  useEffect(() => {
    if (status !== "idle" && status !== "loading") {
      setSlowServerNotice(false);
      return;
    }

    const timer = setTimeout(() => {
      setSlowServerNotice(true);
      notify.info(
        authMessages.serverWaking.title,
        authMessages.serverWaking.description,
        { id: "server-waking" },
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [status]);

  // Unauthenticated: clear cookies and redirect to login with expired reason
  useEffect(() => {
    if (status === "unauthenticated") {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          void clearSessionCookies().then(() => {
            const fullPath = window.location.pathname + window.location.search;
            const safePath = getSafeRedirect(fullPath, "/");
            const encodedRedirect = encodeURIComponent(safePath);
            window.location.assign(
              `/login?redirect=${encodedRedirect}&reason=expired`,
            );
          });
        }
      }
    }
  }, [status]);

  // Authenticated role mismatch: redirect to user's assigned role dashboard
  useEffect(() => {
    if (status === "authenticated" && user) {
      if (user.role !== role) {
        const userHome = ROLE_HOME[user.role] || "/customer";
        window.location.assign(`${userHome}?role_redirect=1`);
      }
    }
  }, [status, user, role]);

  if (status === "idle" || status === "loading") {
    return (
      <div className="space-y-6 w-full max-w-6xl mx-auto py-4">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card shadow-xs">
          <Loader2 className="size-5 animate-spin text-brand-600 shrink-0" />
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-semibold text-charcoal-900">
              Checking your session...
            </p>
            {slowServerNotice && (
              <p className="text-xs text-charcoal-600 animate-in fade-in duration-300">
                The server may be waking up. This can take up to a minute.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (status === "unreachable") {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md border border-border bg-card shadow-sm text-center">
          <CardHeader className="space-y-2 pb-2">
            <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-lg font-bold text-charcoal-900">
              We could not reach the server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-charcoal-600">
            <p>
              The backend service may still be waking up, or your network
              connection might be interrupted.
            </p>
            <p>
              Your session is still intact. You can retry connecting or log out
              safely.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              className="w-full sm:flex-1 gap-2"
              onClick={() => retry()}
            >
              <RefreshCw className="size-4" />
              <span>Retry</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:flex-1 gap-2 text-destructive border-border hover:bg-destructive/10 hover:text-destructive"
              onClick={() => void performLogout()}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (status === "authenticated") {
    if (user && user.role !== role) {
      return null;
    }
    return <>{children}</>;
  }

  return null;
}
