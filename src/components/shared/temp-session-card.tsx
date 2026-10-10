"use client";

import { LogOut, UserCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { performLogout } from "@/lib/session";
import type { Role } from "@/types/auth";

export interface TempSessionCardProps {
  expectedRole: Role;
  dashboardTitle: string;
}

/**
 * TEMPORARY: Temporary session landing card.
 * Will be replaced by real role dashboards in subsequent prompts.
 */
export function TempSessionCard({
  expectedRole,
  dashboardTitle,
}: TempSessionCardProps) {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  const handleLogout = () => {
    void performLogout();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="border border-border">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-28" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isRoleMismatch = role !== expectedRole;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user.name}`}
        description={`${dashboardTitle} • Authenticated Session`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-charcoal-700 hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        }
      />

      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-lg shadow-2xs">
              <UserCircle className="size-7" />
            </div>
            <div>
              <CardTitle className="text-lg text-charcoal-900 font-bold">
                {user.name}
              </CardTitle>
              <CardDescription className="text-sm text-charcoal-600">
                {user.email}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-semibold px-2.5 py-0.5">
              {user.role}
            </Badge>
            {user.status && (
              <Badge
                variant={user.status === "ACTIVE" ? "secondary" : "destructive"}
                className="text-xs"
              >
                {user.status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2 border-t border-border">
          {isRoleMismatch && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-800">
              Note: You are currently signed in as <strong>{user.role}</strong>{" "}
              viewing the <strong>{expectedRole}</strong> workspace.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-panel border border-border">
              <span className="text-xs text-charcoal-600 block">User ID</span>
              <span className="font-mono text-xs text-charcoal-900">
                {user.id}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-panel border border-border">
              <span className="text-xs text-charcoal-600 block">Phone</span>
              <span className="text-xs text-charcoal-900">
                {user.phone || "Not provided"}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-panel/50 border-t border-border py-3 flex items-center justify-between text-xs text-charcoal-600">
          <span>
            Session verified via memory access token &amp; httpOnly refresh
            cookie.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-xs h-7 text-destructive hover:bg-destructive/10"
          >
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
