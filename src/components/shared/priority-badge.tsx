import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/types/work-order";

export interface PriorityBadgeProps {
  priority?: Priority | string | null;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const isHigh =
    priority &&
    (String(priority).toUpperCase() === "HIGH" ||
      String(priority).toUpperCase() === "PREMIUM");

  if (isHigh) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40 inline-flex items-center gap-1",
          className,
        )}
      >
        <Star className="size-3 fill-amber-500 text-amber-500" />
        <span>Premium / High</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 text-[11px] font-medium tracking-wide border shadow-2xs bg-muted/80 text-charcoal-700 dark:text-charcoal-300 border-border",
        className,
      )}
    >
      Normal
    </Badge>
  );
}
