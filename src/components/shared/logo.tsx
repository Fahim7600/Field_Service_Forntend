import { Wrench } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface LogoProps {
  variant?: "default" | "light";
  className?: string;
  showText?: boolean;
}

export function Logo({
  variant = "default",
  className,
  showText = true,
}: LogoProps) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring rounded-lg group transition-opacity hover:opacity-95",
        className,
      )}
      aria-label="Field Service Home"
    >
      <div className="size-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xs shrink-0 transition-transform group-hover:scale-105">
        <Wrench className="size-5 text-white" aria-hidden="true" />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-lg tracking-tight transition-colors",
            isLight ? "text-white" : "text-charcoal-900",
          )}
        >
          Field Service
        </span>
      )}
    </Link>
  );
}
