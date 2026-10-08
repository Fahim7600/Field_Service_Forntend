"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Play,
  PlayCircle,
  ShieldAlert,
  Star,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { RejectTaskDialog } from "@/components/technician/reject-task-dialog";
import { ServiceReportDialog } from "@/components/technician/service-report-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatSafeDate, formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { technicianService } from "@/services/technician.service";
import type { WorkOrderFullDetail } from "@/types/api";

interface TaskDetailClientProps {
  id: string;
}

export function TaskDetailClient({ id }: TaskDetailClientProps) {
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [reportDialogOpen, setReportDialogOpen] = React.useState(false);

  const {
    data: workOrder,
    isLoading,
    isError,
    error,
  } = useQuery<WorkOrderFullDetail>({
    queryKey: ["work-orders", id],
    queryFn: () => technicianService.fetchWorkOrderById(id),
    staleTime: 10000,
  });

  // Mutation: Accept Work Order
  const acceptMutation = useMutation({
    mutationFn: async () => technicianService.acceptTask(id),
    onSuccess: async () => {
      toast.success("Job accepted! Ready for dispatch schedule.");
      await queryClient.invalidateQueries({ queryKey: ["work-orders", id] });
      await queryClient.invalidateQueries({
        queryKey: ["technician", "tasks"],
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  // Mutation: Update Status (ARRIVED, IN_PROGRESS)
  const statusMutation = useMutation({
    mutationFn: async (status: "ARRIVED" | "IN_PROGRESS") => {
      return technicianService.updateTaskStatus(id, { status });
    },
    onSuccess: async (_, newStatus) => {
      const msg =
        newStatus === "ARRIVED"
          ? "Arrival confirmed! Customer notified."
          : "Work started on site!";
      toast.success(msg);
      await queryClient.invalidateQueries({ queryKey: ["work-orders", id] });
      await queryClient.invalidateQueries({
        queryKey: ["technician", "tasks"],
      });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !workOrder) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load work order task
            </h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "This work order could not be found or is not assigned to your profile."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/technician/tasks"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Tasks</span>
            </Link>
            <Button size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const req = workOrder.request;
  const status = workOrder.status;
  const isAssigned = status === "ASSIGNED";
  const isScheduled = status === "SCHEDULED";
  const isArrived = status === "ARRIVED";
  const isInProgress = status === "IN_PROGRESS";
  const isCompleted = status === "COMPLETED";
  const isCancelled = status === "CANCELLED";

  const isHighPriority = req?.priority === "HIGH";
  const categoryName = req?.category?.name || "General Service";

  // Normalize attachments array
  const attachments = (req?.attachments || []).map((att) => {
    if (typeof att === "string") {
      return { url: att, fileName: "Attachment" };
    }
    return {
      id: att.id,
      url: att.url || att.fileUrl || "",
      fileName: att.fileName || "Attachment image",
    };
  });

  const serviceReport = workOrder.serviceReport;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/technician/tasks"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to Tasks</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg font-bold text-foreground">
                Task #{workOrder.id.slice(0, 8)}
              </h1>
              <StatusBadge status={status} />
              {isHighPriority && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs"
                >
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  HIGH PRIORITY
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Request #{req?.requestNumber || "SR"} • Created{" "}
              {formatSafeDate(workOrder.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Job Details) + Right Column (Action Execution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Request Details, Address, Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold">
                  {req?.title || "Work Order Summary"}
                </CardTitle>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Wrench className="size-3 text-primary" />
                  {categoryName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Issue Description
                </span>
                <p className="text-sm text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50">
                  {req?.description || "No specific instructions provided."}
                </p>
              </div>

              {/* Customer & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    Customer Contact
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      {workOrder.customer?.name || "Customer"}
                    </p>
                    {req?.customer?.email && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" />
                        {req.customer.email}
                      </p>
                    )}
                    {req?.customer?.phone && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="size-3" />
                        {req.customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    Site Address
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-foreground">
                      {req?.address || "Address on file"}
                    </p>
                    {workOrder.visitStart && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        Visit: {formatSafeDateTime(workOrder.visitStart)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments Section */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                <span>Customer Photos & Media ({attachments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {attachments.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No images attached to this work order.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att) => (
                    <a
                      key={att.id || att.url}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-muted/40 transition-all hover:ring-2 hover:ring-primary/50"
                    >
                      <Image
                        src={att.url}
                        alt={att.fileName || "Attachment"}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <ExternalLink className="size-5 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* If Completed: Service Report Display */}
          {serviceReport && (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Filed Service Report</span>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-emerald-700 bg-emerald-500/10 border-emerald-500/30 text-xs"
                  >
                    {serviceReport.hoursSpent} Hours Logged
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    Work Performed
                  </span>
                  <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50 whitespace-pre-wrap">
                    {serviceReport.workDone}
                  </p>
                </div>

                {Array.isArray(serviceReport.partsUsed) &&
                  serviceReport.partsUsed.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                        Parts & Materials
                      </span>
                      <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-1">
                        {serviceReport.partsUsed.map((p) => (
                          <div
                            key={`${p.name}-${p.quantity}`}
                            className="flex items-center justify-between text-xs"
                          >
                            <span>{p.name}</span>
                            <span className="font-mono text-muted-foreground">
                              Qty: {p.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {serviceReport.photos && serviceReport.photos.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                      Completion Photos
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {serviceReport.photos.map((photo) => (
                        <a
                          key={photo.url}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative aspect-video rounded-lg overflow-hidden border border-border group"
                        >
                          <Image
                            src={photo.url}
                            alt="Completion photo"
                            fill
                            unoptimized
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: State Machine & Action Bar */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-panel/50 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Navigation className="size-4 text-primary" />
                <span>Job Action Center</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Current Stage:{" "}
                <strong className="text-foreground">{status}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-5">
              {/* Stage 1: ASSIGNED -> Accept or Reject */}
              {isAssigned && (
                <div className="space-y-3">
                  <Alert variant="info" className="text-xs">
                    <Clock className="size-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      Review the task details and accept the assignment to
                      confirm your schedule.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate()}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    <span>Accept Job Assignment</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={acceptMutation.isPending}
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <XCircle className="size-4" />
                    <span>Decline Assignment</span>
                  </Button>
                </div>
              )}

              {/* Stage 2: SCHEDULED -> Mark as Arrived */}
              {isScheduled && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1.5">
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="size-3.5 text-primary" />
                      Visit Window
                    </span>
                    <p className="text-muted-foreground">
                      {formatSafeDate(workOrder.visitStart)} (
                      {formatSafeDateTime(workOrder.visitStart, "h:mm a")} -{" "}
                      {workOrder.visitEnd
                        ? formatSafeDateTime(workOrder.visitEnd, "h:mm a")
                        : "TBD"}
                      )
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate("ARRIVED")}
                  >
                    {statusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Navigation className="size-4" />
                    )}
                    <span>Mark as Arrived on Site</span>
                  </Button>
                </div>
              )}

              {/* Stage 3: ARRIVED -> Start Work */}
              {isArrived && (
                <div className="space-y-3">
                  <Alert variant="info" className="text-xs">
                    <CheckCircle2 className="size-4 text-blue-600" />
                    <AlertTitle>Arrived On Site</AlertTitle>
                    <AlertDescription>
                      Arrival logged at{" "}
                      {workOrder.arrivedAt
                        ? formatSafeDateTime(workOrder.arrivedAt)
                        : "Just now"}
                      . When ready, begin service execution.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate("IN_PROGRESS")}
                  >
                    {statusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4 fill-white" />
                    )}
                    <span>Start Work (Begin Service)</span>
                  </Button>
                </div>
              )}

              {/* Stage 4: IN_PROGRESS -> Complete & File Report */}
              {isInProgress && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                    <span className="font-semibold flex items-center gap-1.5">
                      <PlayCircle className="size-4 text-indigo-600 dark:text-indigo-400" />
                      Job In Progress
                    </span>
                    <p className="text-[11px] opacity-90">
                      Started at{" "}
                      {workOrder.startedAt
                        ? formatSafeDateTime(workOrder.startedAt)
                        : "Recently"}
                      . When finished, file the completion report to close this
                      task.
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setReportDialogOpen(true)}
                  >
                    <FileCheck className="size-4" />
                    <span>Complete & File Report</span>
                  </Button>
                </div>
              )}

              {/* Stage 5: COMPLETED */}
              {isCompleted && (
                <Alert variant="success" className="text-xs">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>Work Order Completed</AlertTitle>
                  <AlertDescription>
                    This job has been completed. The service report was saved
                    and invoiced.
                  </AlertDescription>
                </Alert>
              )}

              {/* Stage 6: CANCELLED */}
              {isCancelled && (
                <Alert variant="destructive" className="text-xs">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>Work Order Cancelled</AlertTitle>
                  <AlertDescription>
                    Reason:{" "}
                    {workOrder.cancelReason ||
                      "Cancelled by admin or customer."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="border-t border-border/80 bg-panel/30 px-6 py-3 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Technician Workflow Portal</span>
              <span className="font-mono text-[10px]">
                {workOrder.id.slice(0, 8)}
              </span>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Dialog: Reject Job */}
      <RejectTaskDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        workOrderId={id}
        requestNumber={req?.requestNumber}
      />

      {/* Dialog: Service Report */}
      <ServiceReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        workOrderId={id}
        requestNumber={req?.requestNumber}
      />
    </div>
  );
}
