"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Star,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { ROLE_HOME } from "@/lib/auth-routes";
import { performLogout } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const { isPremium } = usePremiumStatus();

  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const initials = getInitials(user.name);
  const dashboardHref = ROLE_HOME[user.role] || "/customer";
  const showPremiumBadge = user.role === "CUSTOMER" && isPremium === true;

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    void performLogout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1 sm:px-2.5 sm:py-1.5 text-left text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] transition-colors"
            aria-label="User navigation menu"
          >
            <Avatar className="size-7 sm:size-8 border border-white/20">
              <AvatarFallback className="bg-[#1F2937] text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="max-w-[120px] truncate text-xs font-semibold text-white">
                {user.name}
              </span>
              {showPremiumBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/40">
                  <Star className="size-2.5 fill-amber-300 text-amber-300" />
                  <span>Premium</span>
                </span>
              )}
            </div>
            <ChevronDown className="size-3.5 text-[#CBD5E1] hidden sm:inline-block" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs font-semibold text-charcoal-900 truncate">
                {user.name}
              </p>
              {showPremiumBadge && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Star className="size-2.5 fill-amber-500 text-amber-500" />
                  <span>VIP</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-charcoal-500 truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link
              href={dashboardHref}
              className="w-full flex items-center gap-2"
            >
              <LayoutDashboard className="size-4 text-charcoal-600" />
              <span>Dashboard</span>
            </Link>
          }
        />
        <DropdownMenuItem
          render={
            <Link
              href={`${dashboardHref}/profile`}
              className="w-full flex items-center gap-2"
            >
              <UserIcon className="size-4 text-charcoal-600" />
              <span>Profile</span>
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        >
          <LogOut className="size-4" />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
