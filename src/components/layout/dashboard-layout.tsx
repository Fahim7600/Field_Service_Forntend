import { Suspense } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { RoleRedirectToast } from "@/components/shared/role-redirect-toast";
import type { Role } from "@/types/auth";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  role: Role;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col shrink-0">
        <DashboardSidebar role={role} />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <DashboardTopbar role={role} />

        {/* Dynamic Toast for Role Redirection */}
        <Suspense fallback={null}>
          <RoleRedirectToast />
        </Suspense>

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
