"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Star,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { isPremium } = usePremiumStatus();

  if (!user) return null;

  const initials = getInitials(user.name);
  const dashboardHref = ROLE_HOME[user.role] || "/customer";
  const showPremiumBadge = user.role === "CUSTOMER" && isPremium === true;

  const handleLogout = async () => {
    await performLogout(router);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-full p-1 sm:px-2.5 sm:py-1.5 text-left text-sm font-medium text-charcoal-900 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            aria-label="User navigation menu"
          >
            <Avatar className="size-7 sm:size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="max-w-[120px] truncate text-xs font-semibold text-charcoal-800">
                {user.name}
              </span>
              {showPremiumBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Star className="size-2.5 fill-amber-500 text-amber-500" />
                  <span>Premium</span>
                </span>
              )}
            </div>
            <ChevronDown className="size-3.5 text-charcoal-500 hidden sm:inline-block" />
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
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="size-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
