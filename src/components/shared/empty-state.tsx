import type { LucideIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border-2 border-dashed border-border bg-panel/60",
        className,
      )}
    >
      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-charcoal-600 mb-4 shadow-xs">
        <Icon className="size-6" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-charcoal-900 mb-1">
        {title}
      </h3>

      <p className="text-sm text-charcoal-600 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
