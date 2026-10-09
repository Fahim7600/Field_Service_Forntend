"use client";

import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  Info,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { AssignTechnicianCard } from "@/components/admin/assign-technician-card";
import { ScheduleVisitCard } from "@/components/admin/schedule-visit-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ServiceRequestDetail } from "@/types/api";
import type { WorkOrder, WorkOrderStatusHistoryItem } from "@/types/work-order";

interface WorkOrderDispatchActionsProps {
  workOrder: WorkOrder;
  request?: ServiceRequestDetail | null;
  history?: WorkOrderStatusHistoryItem[] | null;
  onSuccess?: () => void;
}

export function WorkOrderDispatchActions({
  workOrder,
  request,
  history,
  onSuccess,
}: WorkOrderDispatchActionsProps) {
  const status = String(workOrder.status || "").toUpperCase();

  // Status-driven dispatch flow orchestration
  switch (status) {
    case "APPROVED":
      return (
        <AssignTechnicianCard
          workOrder={workOrder}
          request={request}
          history={history}
          onSuccess={onSuccess}
        />
      );

    case "ASSIGNED":
      return (
        <ScheduleVisitCard
          workOrder={workOrder}
          request={request}
          onSuccess={onSuccess}
        />
      );

    case "SCHEDULED":
      return (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Calendar className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Visit Confirmed & Scheduled</span>
            </CardTitle>
            <CardDescription className="text-xs">
              The service appointment is locked on the schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="space-y-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-1.5 font-semibold">
                <User className="size-3.5" />
                <span>
                  Technician: {workOrder.technician?.name || "Assigned"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>
                  Window:{" "}
                  {workOrder.visitStart
                    ? safeFormatDateTime(workOrder.visitStart)
                    : "Not set"}{" "}
                  {workOrder.visitEnd
                    ? `- ${safeFormatDateTime(workOrder.visitEnd)}`
                    : ""}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Visit is scheduled. The technician will update progress upon
              arrival.
            </p>
          </CardContent>
        </Card>
      );

    case "ARRIVED":
    case "IN_PROGRESS":
      return (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Wrench className="size-4 text-primary" />
              <span>Work in Progress</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Field technician is on-site performing service.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 space-y-1.5">
              <p className="font-semibold text-foreground">
                Technician: {workOrder.technician?.name || "Field Tech"}
              </p>
              {workOrder.visitStart && (
                <p className="text-muted-foreground">
                  Started: {safeFormatDateTime(workOrder.visitStart)}
                </p>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real-time work order status is active.
            </p>
          </CardContent>
        </Card>
      );

    case "COMPLETED":
      return (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Work Completed</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Service has been fulfilled by technician. Ready for billing.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Work completed. Ready for invoicing.
            </p>
            <Link
              href="/admin/invoices"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "w-full justify-center gap-1.5 text-xs font-semibold",
              )}
            >
              <FileText className="size-3.5" />
              <span>Go to Admin Invoices</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      );

    case "INVOICED":
    case "PAID":
    case "CLOSED":
      return (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              <span>Status: {status}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-muted-foreground space-y-2">
            <p>
              This work order has completed its operational dispatch lifecycle.
            </p>
            <Link
              href="/admin/invoices"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "w-full justify-center gap-1.5 text-xs",
              )}
            >
              <span>View Billing & Invoices</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardContent>
        </Card>
      );

    case "CANCELLED":
      return (
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardHeader className="pb-3 border-b border-destructive/20">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="size-4" />
              <span>Work Order Cancelled</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs space-y-1.5">
            <p className="font-medium text-charcoal-800 dark:text-charcoal-200">
              {workOrder.cancelReason
                ? `Reason: ${workOrder.cancelReason}`
                : "This work order was cancelled. No dispatch actions required."}
            </p>
            {workOrder.cancelledAt && (
              <p className="text-[11px] text-muted-foreground">
                Cancelled on {safeFormatDateTime(workOrder.cancelledAt)}
              </p>
            )}
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Info className="size-4 text-primary" />
              <span>Status: {workOrder.status}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 text-xs text-muted-foreground">
            No active dispatch actions required for status &quot;
            {workOrder.status}&quot;.
          </CardContent>
        </Card>
      );
  }
}
