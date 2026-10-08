import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types/api";

export interface StatusBadgeProps {
  status: RequestStatus | string | null | undefined;
  className?: string;
}

const STATUS_CONFIGS: Record<string, { label: string; className: string }> = {
  SUBMITTED: {
    label: "Submitted",
    className:
      "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  ASSIGNED: {
    label: "Assigned",
    className:
      "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-charcoal-500/15 text-charcoal-700 border-charcoal-500/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedKey = status
    ? String(status).trim().toUpperCase()
    : "UNKNOWN";
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status ? String(status) : "Unknown",
    className: "bg-muted text-charcoal-700 border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs",
        config.className,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </Badge>
  );
}
