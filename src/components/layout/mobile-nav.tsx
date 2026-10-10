"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthActions } from "./auth-actions";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    if (pathname) {
      setOpen(false);
    }
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleClose = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center size-11 min-h-[44px] min-w-[44px] rounded-md text-white hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FBBF24] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] transition-colors"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation-panel"
      >
        {open ? (
          <X className="size-6 text-white" aria-hidden="true" />
        ) : (
          <Menu className="size-6 text-white" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          id="mobile-navigation-panel"
          className="absolute top-full left-0 right-0 w-full bg-[#111827] border-b border-[#1F2937] shadow-2xl p-5 flex flex-col gap-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* "Book Service" cta at the top of the panel */}
          <div>
            <Link
              href="/customer/requests/new"
              onClick={handleClose}
              className={cn(
                buttonVariants({ variant: "cta" }),
                "w-full justify-center h-11 text-base font-semibold shadow-sm",
              )}
            >
              Book Service
            </Link>
          </div>

          {/* Links stacked with 48px height */}
          <NavLinks orientation="vertical" onLinkClick={handleClose} />

          {/* Login and Register at the bottom */}
          <div className="pt-3 border-t border-[#1F2937]">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#CBD5E1] mb-2 px-1">
              Account
            </p>
            <AuthActions
              className="flex-col w-full [&>a]:w-full [&>a]:justify-center [&>a]:h-11"
              onActionClick={handleClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}
