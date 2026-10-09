import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  UserCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { WorkOrder } from "@/types/work-order";

// Replaced with the assign and schedule forms in the next prompt
interface WorkOrderDispatchActionsProps {
  workOrder: WorkOrder;
}

export function WorkOrderDispatchActions({
  workOrder,
}: WorkOrderDispatchActionsProps) {
  const status = String(workOrder.status || "").toUpperCase();

  const renderGuidance = () => {
    switch (status) {
      case "APPROVED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-200">
            <UserCheck className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Ready for technician assignment</p>
              <p className="text-muted-foreground">
                This work order has been approved. Assign an eligible technician
                and schedule the service visit window.
              </p>
            </div>
          </div>
        );

      case "ASSIGNED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <Clock className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                Waiting for the technician to accept
              </p>
              <p className="text-muted-foreground">
                Technician assignment is pending acceptance by the assigned
                field technician.
              </p>
            </div>
          </div>
        );

      case "SCHEDULED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
            <Calendar className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Visit scheduled</p>
              <p className="text-muted-foreground">
                The technician has accepted and the visit window is confirmed on
                the field schedule.
              </p>
            </div>
          </div>
        );

      case "IN_PROGRESS":
      case "ARRIVED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200">
            <CheckCircle2 className="size-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Work is underway</p>
              <p className="text-muted-foreground">
                The technician is currently on-site performing the service.
              </p>
            </div>
          </div>
        );

      case "COMPLETED":
      case "INVOICED":
      case "PAID":
      case "CLOSED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Work completed</p>
              <p className="text-muted-foreground">
                This work order has been fulfilled.
              </p>
            </div>
          </div>
        );

      case "CANCELLED":
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Work order cancelled</p>
              <p className="text-muted-foreground">
                {workOrder.cancelReason
                  ? `Reason: ${workOrder.cancelReason}`
                  : "No further dispatch action required."}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 mt-0.5" />
            <p>
              Status: {workOrder.status}. No immediate dispatch action required.
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
          <Clock className="size-4 text-primary" />
          <span>Dispatch Status & Next Steps</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Current status guidance and dispatch workflow progression.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">{renderGuidance()}</CardContent>
    </Card>
  );
}
