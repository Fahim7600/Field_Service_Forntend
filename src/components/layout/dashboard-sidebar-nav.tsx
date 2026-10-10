"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type DashboardLink,
  ROLE_DASHBOARD_GROUPS,
  ROLE_DASHBOARD_LINKS,
} from "@/constants/dashboard";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

export interface DashboardSidebarNavProps {
  role: Role;
  onLinkClick?: () => void;
}

function isLinkActive(pathname: string, href: string): boolean {
  // Root role landing pages must match exactly to avoid highlighting on subroutes
  if (
    href === "/admin" ||
    href === "/customer" ||
    href === "/technician" ||
    href === "/dashboard"
  ) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavLinkItemProps {
  link: DashboardLink;
  pathname: string;
  onLinkClick?: () => void;
}

function NavLinkItem({ link, pathname, onLinkClick }: NavLinkItemProps) {
  const Icon = link.icon;
  const isActive = isLinkActive(pathname, link.href);

  return (
    <Link
      href={link.href}
      onClick={onLinkClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        isActive
          ? "bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950/40 dark:text-brand-300"
          : "text-charcoal-600 hover:bg-muted hover:text-charcoal-900 dark:text-charcoal-400 dark:hover:text-charcoal-100",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          isActive
            ? "text-brand-600 dark:text-brand-400"
            : "text-charcoal-500 dark:text-charcoal-400",
        )}
      />
      <span>{link.label}</span>
    </Link>
  );
}

export function DashboardSidebarNav({
  role,
  onLinkClick,
}: DashboardSidebarNavProps) {
  const pathname = usePathname();
  const groups = ROLE_DASHBOARD_GROUPS[role];
  const flatLinks = ROLE_DASHBOARD_LINKS[role] || [];

  // Grouped Navigation (for Admin)
  if (groups && groups.length > 0) {
    return (
      <nav className="space-y-5 px-3 py-1">
        {groups.map((group, groupIdx) => {
          const groupId = `nav-group-${group.label.toLowerCase().replace(/\s+/g, "-")}`;

          return (
            // biome-ignore lint/a11y/useSemanticElements: ARIA group container for nav grouping
            <div
              key={group.label || groupIdx}
              role="group"
              aria-labelledby={groupId}
              className="space-y-1"
            >
              <div
                id={groupId}
                className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 select-none"
              >
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.links.map((link) => (
                  <NavLinkItem
                    key={link.href}
                    link={link}
                    pathname={pathname}
                    onLinkClick={onLinkClick}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    );
  }

  // Flat Navigation (for Customer & Technician)
  return (
    <nav className="space-y-1 px-3 py-1">
      {flatLinks.map((link) => (
        <NavLinkItem
          key={link.href}
          link={link}
          pathname={pathname}
          onLinkClick={onLinkClick}
        />
      ))}
    </nav>
  );
}
