"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/constants/site";
import { cn } from "@/lib/utils";

export interface NavLinksProps {
  className?: string;
  onLinkClick?: () => void;
  orientation?: "horizontal" | "vertical";
}

export function NavLinks({
  className,
  onLinkClick,
  orientation = "horizontal",
}: NavLinksProps) {
  const pathname = usePathname();

  const isVertical = orientation === "vertical";

  return (
    <nav
      className={cn(
        isVertical
          ? "flex flex-col space-y-1"
          : "flex items-center space-x-1 lg:space-x-2",
        className,
      )}
      aria-label="Main Navigation"
    >
      {mainNav.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "text-sm font-medium transition-colors relative py-2 px-3 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "text-charcoal-900 font-semibold"
                : "text-charcoal-600 hover:text-charcoal-900 hover:bg-muted/50",
              isVertical &&
                isActive &&
                "bg-muted/70 text-charcoal-900 border-l-2 border-brand-500 pl-3 rounded-l-none",
            )}
          >
            {item.title}
            {!isVertical && isActive && (
              <span
                className="absolute bottom-0 left-3 right-3 h-[2px] bg-brand-500 rounded-full"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
