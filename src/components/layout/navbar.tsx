import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthActions } from "./auth-actions";
import { MobileNav } from "./mobile-nav";
import { NavLinks } from "./nav-links";

export function Navbar() {
  return (
    <>
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-charcoal-900 focus:text-white focus:rounded-md focus:shadow-md focus:outline-hidden focus:ring-2 focus:ring-brand-500 text-sm font-medium"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full bg-[#111827] border-b border-[#1F2937] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo on Left */}
          <div className="flex items-center gap-6">
            <Logo variant="light" />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <NavLinks />
          </div>

          {/* Right Auth Slot (Desktop) & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "sm" }),
                "hidden lg:inline-flex font-semibold shadow-xs",
              )}
            >
              Book Service
            </Link>
            <div className="hidden md:flex items-center">
              <AuthActions />
            </div>
            <MobileNav />
          </div>
        </div>

        {/* 2px amber accent line along the very bottom edge */}
        <div className="h-[2px] w-full bg-[#F97316]" aria-hidden="true" />
      </header>
    </>
  );
}
