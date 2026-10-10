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
      aria-label={isVertical ? "Mobile Navigation" : "Main Navigation"}
    >
      {mainNav.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (isVertical) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-12 flex items-center px-4 rounded-md text-base font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
                isActive
                  ? "bg-white/10 text-white font-semibold border-l-4 border-[#FBBF24] pl-3 rounded-l-none"
                  : "text-[#E2E8F0] hover:text-white hover:bg-white/5",
              )}
            >
              {item.title}
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative py-2 px-3 text-sm font-medium transition-colors rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
              isActive
                ? "text-white font-semibold"
                : "text-[#E2E8F0] hover:text-white",
            )}
          >
            {item.title}
            <span
              className={cn(
                "absolute bottom-0 left-3 right-3 h-[2px] bg-[#FBBF24] rounded-full transition-transform duration-200 origin-center",
                isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              )}
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}
