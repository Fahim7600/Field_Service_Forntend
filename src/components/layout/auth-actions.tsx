"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent layout shifts and hydration mismatch
  if (!mounted || isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="h-9 w-20 rounded-lg" />
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
