import { AlertCircle, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkOrderStatus } from "@/types/work-order";

interface WorkProgressStepperProps {
  status?: WorkOrderStatus | string | null;
  className?: string;
}

const STEP_ORDER: Array<{ key: string; label: string }> = [
  { key: "ASSIGNED", label: "Assigned" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "ARRIVED", label: "Arrived" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "COMPLETED", label: "Completed" },
];

export function WorkProgressStepper({
  status,
  className,
}: WorkProgressStepperProps) {
  const normStatus = String(status || "").toUpperCase();

  // Cancelled State
  if (normStatus === "CANCELLED") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold",
          className,
        )}
      >
        <AlertCircle className="size-4 shrink-0" />
        <span>Work order has been cancelled</span>
      </div>
    );
  }

  // Post-completion states (INVOICED, PAID, CLOSED)
  const isPostCompleted =
    normStatus === "INVOICED" ||
    normStatus === "PAID" ||
    normStatus === "CLOSED";

  // Determine active step index
  const activeIndex = isPostCompleted
    ? STEP_ORDER.length // all complete
    : STEP_ORDER.findIndex((s) => s.key === normStatus);

  return (
    <nav
      aria-label="Work order progress"
      className={cn(
        "p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3",
        className,
      )}
    >
      {/* Post-completion extra badge */}
      {isPostCompleted && (
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/60">
          <span className="text-xs text-muted-foreground font-medium">
            Service Complete
          </span>
          <Badge variant="secondary" className="font-semibold text-xs">
            Billing Status: {normStatus}
          </Badge>
        </div>
      )}

      {/* Responsive Stepper Container: Vertical on mobile, Horizontal on md+ */}
      <ol className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-2 w-full">
        {STEP_ORDER.map((step, idx) => {
          const isCompleted =
            isPostCompleted || (activeIndex !== -1 && idx < activeIndex);
          const isCurrent = !isPostCompleted && activeIndex === idx;
          const isFuture = activeIndex !== -1 ? idx > activeIndex : idx > 0;

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center gap-3 md:gap-2 flex-1 w-full md:w-auto relative"
            >
              {/* Connecting line for desktop (hidden on last item) */}
              {idx < STEP_ORDER.length - 1 && (
                <div
                  aria-hidden="true"
                  className={cn(
                    "hidden md:block absolute top-1/2 left-[calc(50%+1.25rem)] right-[-calc(50%-1.25rem)] h-0.5 -translate-y-1/2 z-0",
                    isCompleted ? "bg-brand-600" : "bg-border",
                  )}
                />
              )}

              {/* Step indicator circle */}
              <div
                className={cn(
                  "size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all z-10 shrink-0",
                  isCompleted &&
                    "bg-brand-600 border-brand-600 text-white shadow-2xs",
                  isCurrent &&
                    "border-brand-600 bg-brand-600/10 text-brand-600 ring-4 ring-brand-600/20 font-extrabold",
                  isFuture && "border-border bg-muted/60 text-muted-foreground",
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step label */}
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "text-xs leading-tight whitespace-nowrap",
                    isCurrent && "font-bold text-brand-600 dark:text-brand-400",
                    isCompleted &&
                      "font-semibold text-charcoal-900 dark:text-charcoal-100",
                    isFuture && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
