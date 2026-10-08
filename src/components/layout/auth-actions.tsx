"use client";

import Link from "next/link";
import { UserMenu } from "@/components/layout/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export interface AuthActionsProps {
  className?: string;
  onActionClick?: () => void;
}

export function AuthActions({ className, onActionClick }: AuthActionsProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Prevent layout shifts / hydration mismatch while checking session
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-8 w-18 rounded-lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className={cn("flex items-center", className)}>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Link
        href="/login"
        onClick={onActionClick}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Login
      </Link>
      <Link
        href="/register"
        onClick={onActionClick}
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Register
      </Link>
    </div>
  );
}
