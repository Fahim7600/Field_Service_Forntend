"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
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

  if (!user) return null;

  const initials = getInitials(user.name);
  const dashboardHref = ROLE_HOME[user.role] || "/customer";

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
            <span className="hidden sm:inline-block max-w-[120px] truncate text-xs font-semibold text-charcoal-800">
              {user.name}
            </span>
            <ChevronDown className="size-3.5 text-charcoal-500 hidden sm:inline-block" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-0.5">
            <p className="text-xs font-semibold text-charcoal-900 truncate">
              {user.name}
            </p>
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
            <Link href="/profile" className="w-full flex items-center gap-2">
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
