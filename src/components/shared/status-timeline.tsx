import { ArrowRight, Clock, User } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { safeFormatDateTime } from "@/lib/format";
import type { WorkOrderStatusHistoryItem } from "@/types/work-order";

interface StatusTimelineProps {
  history: WorkOrderStatusHistoryItem[];
  className?: string;
}

export function StatusTimeline({ history, className }: StatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
        No status changes yet.
      </div>
    );
  }

  // Ensure newest first
  const sortedHistory = [...history].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  return (
    <div className={`relative pl-6 space-y-6 ${className || ""}`}>
      {/* Vertical Connecting Line */}
      <div
        className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-border"
        aria-hidden="true"
      />

      {sortedHistory.map((item, index) => {
        const changedByName =
          typeof item.changedBy === "object" && item.changedBy !== null
            ? item.changedBy.name
            : typeof item.changedBy === "string"
              ? item.changedBy
              : null;

        const roleName =
          typeof item.changedBy === "object" && item.changedBy !== null
            ? item.changedBy.role
            : null;

        return (
          <div
            key={item.id || index}
            className="relative flex items-start gap-3 text-xs"
          >
            {/* Dot marker */}
            <div
              className={`absolute -left-6 top-1 size-5 rounded-full border-2 bg-background flex items-center justify-center shrink-0 ${
                index === 0
                  ? "border-primary text-primary shadow-xs"
                  : "border-muted-foreground/40 text-muted-foreground"
              }`}
            >
              <div
                className={`size-2 rounded-full ${
                  index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
            </div>

            {/* Timeline content */}
            <div className="space-y-1.5 w-full bg-muted/20 p-3 rounded-lg border border-border/60">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.fromStatus ? (
                    <>
                      <StatusBadge status={item.fromStatus} />
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                    </>
                  ) : null}
                  <StatusBadge status={item.toStatus} />
                </div>

                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {safeFormatDateTime(item.createdAt)}
                </span>
              </div>

              {/* Note or reason */}
              {(item.note || item.reason) && (
                <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed pt-0.5">
                  {item.note || item.reason}
                </p>
              )}

              {/* Who changed it */}
              {changedByName && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <User className="size-3" />
                  <span>Changed by {changedByName}</span>
                  {roleName && (
                    <span className="font-semibold text-charcoal-700 dark:text-charcoal-300">
                      ({roleName})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
