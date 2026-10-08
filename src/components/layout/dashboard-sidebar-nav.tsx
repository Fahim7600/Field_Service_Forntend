"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardLink } from "@/constants/dashboard";
import { cn } from "@/lib/utils";

export interface DashboardSidebarNavProps {
  links: DashboardLink[];
  onLinkClick?: () => void;
}

export function DashboardSidebarNav({
  links,
  onLinkClick,
}: DashboardSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5 px-3">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== "/admin" &&
            link.href !== "/customer" &&
            link.href !== "/technician" &&
            pathname.startsWith(`${link.href}/`));

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "bg-brand-50 text-brand-700 font-semibold"
                : "text-charcoal-600 hover:bg-muted hover:text-charcoal-900",
            )}
          >
            <Icon
              className={cn(
                "size-4.5 shrink-0",
                isActive ? "text-brand-600" : "text-charcoal-500",
              )}
            />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
