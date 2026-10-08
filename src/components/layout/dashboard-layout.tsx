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
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col">
        <DashboardSidebar role={role} />
      </div>

      {/* Main Column */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Topbar */}
        <DashboardTopbar role={role} />

        {/* Dynamic Toast for Role Redirection */}
        <Suspense fallback={null}>
          <RoleRedirectToast />
        </Suspense>

        {/* Main Content Area */}
        <main
          id="main-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
