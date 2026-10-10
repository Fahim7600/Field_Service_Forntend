"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { performLogout } from "@/lib/session";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/types/auth";

export interface DashboardSidebarProps {
  id?: string;
  role: Role;
  className?: string;
  onLinkClick?: () => void;
}

const ROLE_LABELS: Record<Role, { title: string; badge: string }> = {
  ADMIN: { title: "Command Center", badge: "Admin" },
  TECHNICIAN: { title: "Field Operations", badge: "Technician" },
  CUSTOMER: { title: "Customer Portal", badge: "Customer" },
};

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function DashboardSidebar({
  id,
  role,
  className,
  onLinkClick,
}: DashboardSidebarProps) {
  const user = useAuthStore((state) => state.user);
  const meta = ROLE_LABELS[role] || { title: "Workspace", badge: role };

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;
    setLoggingOut(true);
    if (onLinkClick) onLinkClick();
    void performLogout();
  };

  const initials = getInitials(user?.name);

  return (
    <aside
      id={id}
      className={cn(
        "flex h-full w-64 flex-col bg-panel border-r border-border",
        className,
      )}
    >
      {/* Top Logo & Role Badge Header */}
      <div className="flex flex-col gap-3 p-5 pb-4">
        <Logo />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
            {meta.title}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 font-medium"
          >
            {meta.badge}
          </Badge>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto">
        <DashboardSidebarNav role={role} onLinkClick={onLinkClick} />
      </div>

      {/* Bottom User & Logout Panel */}
      <div className="p-4 border-t border-border mt-auto space-y-3">
        {user && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card border border-border/80 shadow-2xs">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={loggingOut}
          className="w-full justify-center gap-2 shadow-2xs h-9 font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          <span>{loggingOut ? "Logging out..." : "Log out"}</span>
        </Button>
      </div>
    </aside>
  );
}
