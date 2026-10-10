"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Role } from "@/types/auth";

export interface DashboardTopbarProps {
  role: Role;
}

export function DashboardTopbar({ role }: DashboardTopbarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-2xs">
      {/* Left side: Mobile Hamburger Trigger */}
      <div className="flex items-center gap-3">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-charcoal-800 hover:bg-muted"
                aria-label="Open sidebar navigation"
              >
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 max-w-[80vw]">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <DashboardSidebar
              role={role}
              className="w-full border-r-0"
              onLinkClick={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Right side: Notifications Bell & UserMenu */}
      <div className="flex items-center gap-3">
        <NotificationBell role={role} />
        <UserMenu />
      </div>
    </header>
  );
}
