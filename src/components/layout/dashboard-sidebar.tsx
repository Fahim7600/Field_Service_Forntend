import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ROLE_DASHBOARD_LINKS } from "@/constants/dashboard";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

export interface DashboardSidebarProps {
  role: Role;
  className?: string;
  onLinkClick?: () => void;
}

const ROLE_LABELS: Record<Role, { title: string; badge: string }> = {
  ADMIN: { title: "Command Center", badge: "Admin" },
  TECHNICIAN: { title: "Field Operations", badge: "Technician" },
  CUSTOMER: { title: "Customer Portal", badge: "Customer" },
};

export function DashboardSidebar({
  role,
  className,
  onLinkClick,
}: DashboardSidebarProps) {
  const links = ROLE_DASHBOARD_LINKS[role] || [];
  const meta = ROLE_LABELS[role] || { title: "Workspace", badge: role };

  return (
    <aside
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
        <DashboardSidebarNav links={links} onLinkClick={onLinkClick} />
      </div>

      {/* Bottom Panel */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="rounded-xl bg-card border border-border p-3">
          <p className="text-xs font-semibold text-charcoal-900">
            Field Service v0.1
          </p>
          <p className="text-[11px] text-charcoal-500 mt-0.5">
            Operations & Telemetry
          </p>
        </div>
      </div>
    </aside>
  );
}
