import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string | null | undefined;
  label?: string;
  className?: string;
}

function toTitleCase(str: string): string {
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_CONFIGS: Record<string, { label: string; className: string }> = {
  SUBMITTED: {
    label: "Submitted",
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
      "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-500/30",
  },
  SCHEDULED: {
    label: "Scheduled",
    className:
      "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
  },
  ARRIVED: {
    label: "Arrived",
    className:
      "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  INVOICED: {
    label: "Invoiced",
    className:
      "bg-teal-500/15 text-teal-800 dark:text-teal-300 border-teal-500/30",
  },
  PAID: {
    label: "Paid",
    className:
      "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs bg-muted text-charcoal-700 border-border",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-current mr-1.5 opacity-80" />
        {label || "Unknown"}
      </Badge>
    );
  }

  const normalizedKey = String(status).trim().toUpperCase();
  const config = STATUS_CONFIGS[normalizedKey];

  const badgeLabel =
    label || (config ? config.label : toTitleCase(String(status)));
  const badgeClasses = config
    ? config.className
    : "bg-muted text-charcoal-700 border-border";

  return (
    <Badge
      variant="outline"
      className={cn(
        "px-2.5 py-0.5 text-[11px] font-semibold tracking-wide border shadow-2xs",
        badgeClasses,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {badgeLabel}
    </Badge>
  );
}
