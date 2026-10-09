import { AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelative, isPast, parseSafeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DueBadgeProps {
  reviewDueAt?: string | null;
  status?: string | null;
  className?: string;
}

export function DueBadge({ reviewDueAt, status, className }: DueBadgeProps) {
  if (!reviewDueAt) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const parsed = parseSafeDate(reviewDueAt);
  if (!parsed) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const isSubmitted = !status || String(status).toUpperCase() === "SUBMITTED";
  const overdue = isPast(parsed) && isSubmitted;
  const relativeText = formatRelative(parsed);

  if (overdue) {
    const cleanRelative = relativeText
      .replace(/ago$/i, "")
      .replace(/^in /i, "")
      .trim();

    return (
      <Badge
        variant="outline"
        className={cn(
          "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs bg-destructive/15 text-destructive border-destructive/30 inline-flex items-center gap-1",
          className,
        )}
      >
        <AlertCircle className="size-3 shrink-0" />
        <span>Overdue by {cleanRelative}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 text-[11px] font-normal tracking-wide border bg-muted/60 text-muted-foreground border-border inline-flex items-center gap-1",
        className,
      )}
    >
      <Clock className="size-3 shrink-0" />
      <span>Due {relativeText}</span>
    </Badge>
  );
}
