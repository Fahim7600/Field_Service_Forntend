"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "@/components/layout/user-menu";
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
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3.5 transition-colors border border-white/20 text-white hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
        )}
      >
        Login
      </Link>
      <Link
        href="/register"
        onClick={onActionClick}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-semibold h-9 px-3.5 transition-colors bg-white text-[#111827] hover:bg-slate-100 shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
        )}
      >
        Register
      </Link>
    </div>
  );
}
