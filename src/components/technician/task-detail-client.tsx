"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  History,
  ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Play,
  RefreshCw,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { WorkProgressStepper } from "@/components/shared/work-progress-stepper";
import { RejectTaskDialog } from "@/components/technician/reject-task-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTaskActions } from "@/hooks/use-task-actions";
import { getErrorMessage } from "@/lib/api-client";
import { safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getTechnicianActions } from "@/lib/work-order-rules";
import { requestsService } from "@/services/requests.service";
import { technicianService } from "@/services/technician.service";
import { workOrdersService } from "@/services/work-orders.service";
import type { ServiceRequestDetail } from "@/types/api";
import type { WorkOrder, WorkOrderStatusHistoryItem } from "@/types/work-order";

interface TaskDetailClientProps {
  id: string;
}

export function TaskDetailClient({ id }: TaskDetailClientProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: () => {},
  });

  // 1. Fetch Task / Work Order
  const {
    data: task,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WorkOrder>({
    queryKey: ["technician", "task", id],
    queryFn: () => technicianService.fetchTaskById(id),
    staleTime: 10000,
    retry: (failureCount, err) => {
      const msg = getErrorMessage(err);
      if (
        msg.includes("403") ||
        msg.includes("404") ||
        msg.toLowerCase().includes("not found") ||
        (err &&
          typeof err === "object" &&
          "status" in err &&
          (err.status === 403 || err.status === 404))
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const requestId =
    task?.serviceRequestId || task?.requestId || task?.request?.id;

  // 2. Fetch linked service request (for attachments & category details)
  const { data: requestDetail } = useQuery<ServiceRequestDetail>({
    queryKey: ["requests", requestId],
    queryFn: () => requestsService.fetchRequestById(requestId as string),
    staleTime: 15000,
    enabled: Boolean(requestId),
    retry: false, // Fall back cleanly to embedded request data
  });

  // 3. Fetch history timeline
  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery<WorkOrderStatusHistoryItem[]>({
    queryKey: ["admin", "work-orders", id, "history"],
    queryFn: () => workOrdersService.fetchWorkOrderHistory(id),
    staleTime: 10000,
    enabled: Boolean(task),
    retry: false,
  });

  // Task Action Mutations Hook
  const { acceptTask, advanceStatus, isBusy, isAccepting, isAdvancing } =
    useTaskActions({
      taskId: id,
      refetchTask: async () => {
        await refetch();
        await refetchHistory();
      },
    });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const errorMessage = error ? getErrorMessage(error) : "";
  const isForbiddenOrNotFound =
    !task &&
    (errorMessage.includes("403") ||
      errorMessage.includes("404") ||
      errorMessage.toLowerCase().includes("not found") ||
      (error &&
        typeof error === "object" &&
        "status" in error &&
        (error.status === 403 || error.status === 404)));

  if (isForbiddenOrNotFound) {
    return (
      <Card className="border-border bg-card p-8 text-center max-w-lg mx-auto shadow-xs">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              This job is not available
            </h2>
            <p className="text-xs text-muted-foreground">
              The task you requested could not be found or you do not have
              permission to view it.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/technician/tasks"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to tasks</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !task) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto shadow-xs">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-destructive">
              Failed to load task details
            </h2>
            <p className="text-xs text-muted-foreground">
              {errorMessage ||
                "An unexpected error occurred while communicating with the server."}
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
              <span>Back to tasks</span>
            </Link>
            <Button size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const actionType = getTechnicianActions(task);
  const activeRequest = requestDetail || task.request;
  const address = activeRequest?.address || "";
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    : "";

  // Normalize attachments
  const rawAttachments = requestDetail?.attachments || [];
  const attachments = rawAttachments.map((att, idx: number) => {
    if (typeof att === "string") {
      return { id: `att-${idx}`, url: att, fileName: `Photo ${idx + 1}` };
    }
    return {
      id: att?.id || `att-${idx}`,
      url: att?.url || att?.fileUrl || "",
      fileName: att?.fileName || `Photo ${idx + 1}`,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb & Status */}
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
            <span className="sr-only">Back to tasks</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-lg font-bold text-charcoal-900 dark:text-charcoal-100">
                Task {task.workOrderNumber || `#${task.id.slice(0, 8)}`}
              </h1>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned work order execution
            </p>
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <WorkProgressStepper status={task.status} />

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Visit Window */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span>Visit Schedule Window</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">
                  {task.visitStart
                    ? safeFormatDateTime(task.visitStart)
                    : "Not scheduled yet by dispatcher"}
                </span>
                {task.visitEnd && (
                  <span className="text-muted-foreground">
                    (Ends {safeFormatDateTime(task.visitEnd)})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Customer and Location */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Customer & Service Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Customer Name
                  </span>
                  <span className="font-semibold text-foreground text-sm">
                    {task.customer?.name || "Not provided"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Phone Number
                  </span>
                  {task.customer?.phone ? (
                    <a
                      href={`tel:${task.customer.phone}`}
                      className="text-primary hover:underline flex items-center gap-1.5 font-semibold text-sm"
                    >
                      <Phone className="size-3.5" />
                      <span>{task.customer.phone}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-border/60">
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                  Service Address
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{address || "Address not provided"}</span>
                  </div>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-7 text-xs gap-1.5 self-start sm:self-auto",
                      )}
                    >
                      <Navigation className="size-3" />
                      <span>Open in Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Job Details */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wrench className="size-4 text-primary" />
                  <span>Job Details & Description</span>
                </CardTitle>
                {activeRequest?.category?.name && (
                  <Badge variant="secondary" className="font-semibold text-xs">
                    {activeRequest.category.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                  Problem Title
                </span>
                <p className="font-bold text-foreground text-sm">
                  {activeRequest?.title || "Service Request"}
                </p>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                  Description
                </span>
                <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/60">
                  {activeRequest?.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Attachments */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                <span>Job Attachments ({attachments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {attachments.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No photos or attachments provided with this job.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att, idx) => (
                    <a
                      key={att.id || idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-muted/40 transition-all hover:ring-2 hover:ring-primary/50"
                    >
                      {att.url ? (
                        <Image
                          src={att.url}
                          alt={att.fileName || `Attachment ${idx + 1}`}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No URL
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <ExternalLink className="size-5 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 5: Service Report (if filed) */}
          {task.serviceReport && (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600" />
                    <span>Submitted Service Report</span>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] font-semibold border-emerald-300"
                  >
                    Report Filed
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                {task.serviceReport.workDone && (
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                      Work Performed
                    </span>
                    <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/60">
                      {task.serviceReport.workDone}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {typeof task.serviceReport.hoursSpent === "number" && (
                    <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Labor Hours
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {task.serviceReport.hoursSpent} hrs
                      </p>
                    </div>
                  )}

                  {task.serviceReport.partsUsed ? (
                    <div className="p-3 bg-muted/20 border border-border/60 rounded-lg">
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Parts Used
                      </span>
                      <p className="font-medium text-foreground text-xs">
                        {typeof task.serviceReport.partsUsed === "string"
                          ? task.serviceReport.partsUsed
                          : JSON.stringify(task.serviceReport.partsUsed)}
                      </p>
                    </div>
                  ) : null}
                </div>

                {Array.isArray(task.serviceReport.photos) &&
                  task.serviceReport.photos.length > 0 && (
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">
                        Completion Photos ({task.serviceReport.photos.length})
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {task.serviceReport.photos.map((p, pIdx) => {
                          const pUrl = typeof p === "string" ? p : p.url;
                          return (
                            <a
                              key={pUrl || pIdx}
                              href={pUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative block aspect-square overflow-hidden rounded-lg border border-border bg-muted/40 hover:ring-2 hover:ring-primary/50"
                            >
                              <Image
                                src={pUrl}
                                alt={`Completion Photo ${pIdx + 1}`}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                                <ExternalLink className="size-4 text-white" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Card 6: Status Timeline History */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-primary" />
                <span>Status History</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Log of transitions and updates recorded for this job.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isHistoryLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : isHistoryError ? (
                <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs text-muted-foreground space-y-2">
                  <p>Status transition history is currently unavailable.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchHistory()}
                    className="h-7 text-xs"
                  >
                    Retry History
                  </Button>
                </div>
              ) : (
                <StatusTimeline history={history || []} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Action Center (Sticky on lg) */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-panel/50 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                <span>Technician Action Center</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Current execution step for this assignment.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* RESPOND state */}
              {actionType === "RESPOND" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Review this assignment and confirm whether you can accept it
                    or need to decline.
                  </p>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="default"
                      className="w-full justify-center gap-2 font-semibold shadow-xs"
                      disabled={isBusy}
                      onClick={() =>
                        setConfirmModal({
                          isOpen: true,
                          title: "Accept this job assignment?",
                          description:
                            "Accepting this job confirms your availability. The dispatcher will schedule the visit window.",
                          action: () => acceptTask(),
                        })
                      }
                    >
                      {isAccepting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      <span>Accept Job</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-center gap-2 font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
                      disabled={isBusy}
                      onClick={() => setRejectDialogOpen(true)}
                    >
                      <XCircle className="size-4" />
                      <span>Reject Job</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* AWAIT_SCHEDULE state */}
              {actionType === "AWAIT_SCHEDULE" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Job Accepted</p>
                      <p className="text-muted-foreground">
                        You accepted this job. The dispatcher will schedule the
                        confirmed visit window soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MARK_ARRIVED state */}
              {actionType === "MARK_ARRIVED" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Once you arrive on-site at the customer&apos;s address, mark
                    your arrival to notify dispatch and customer.
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    className="w-full justify-center gap-2 font-semibold shadow-xs"
                    disabled={isBusy}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: "Confirm arrival on-site?",
                        description:
                          "Confirm that you have arrived at the customer's service address.",
                        action: () => advanceStatus("ARRIVED"),
                      })
                    }
                  >
                    {isAdvancing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <MapPin className="size-4" />
                    )}
                    <span>Mark as Arrived</span>
                  </Button>
                </div>
              )}

              {/* START_WORK state */}
              {actionType === "START_WORK" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    You have arrived on-site. Click below when you start the
                    diagnostic and service work.
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    className="w-full justify-center gap-2 font-semibold shadow-xs"
                    disabled={isBusy}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: "Start service execution?",
                        description:
                          "Confirm that you are starting active work on this job.",
                        action: () => advanceStatus("IN_PROGRESS"),
                      })
                    }
                  >
                    {isAdvancing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Play className="size-4" />
                    )}
                    <span>Start Work</span>
                  </Button>
                </div>
              )}

              {/* FILE_REPORT state */}
              {actionType === "FILE_REPORT" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Work is in progress. Once complete, fill out the service
                    report to close the job and trigger invoicing.
                  </p>
                  <Link
                    href={`/technician/tasks/${id}/report`}
                    className={cn(
                      buttonVariants({ variant: "default", size: "sm" }),
                      "w-full justify-center gap-2 font-semibold shadow-xs",
                    )}
                  >
                    <FileText className="size-4" />
                    <span>Complete and File Report</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}

              {/* NONE state */}
              {actionType === "NONE" && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.status} />
                  </div>
                  {task.status === "COMPLETED" && (
                    <p>Job completed. Waiting for the invoice.</p>
                  )}
                  {(task.status === "INVOICED" ||
                    task.status === "PAID" ||
                    task.status === "CLOSED") && (
                    <p>This job is completed and finalized.</p>
                  )}
                  {task.status === "CANCELLED" && (
                    <p>
                      {task.cancelReason
                        ? `Job cancelled: ${task.cancelReason}`
                        : "This job has been cancelled."}
                    </p>
                  )}
                  {![
                    "COMPLETED",
                    "INVOICED",
                    "PAID",
                    "CLOSED",
                    "CANCELLED",
                  ].includes(String(task.status)) && (
                    <p>No active technician action required for this status.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AlertDialog
        open={confirmModal.isOpen}
        onOpenChange={(open) =>
          setConfirmModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmModal.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmModal.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmModal.action();
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
              }}
              disabled={isBusy}
              className="gap-2"
            >
              {isBusy && <Loader2 className="size-4 animate-spin" />}
              <span>Confirm</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Task Dialog Modal */}
      <RejectTaskDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        workOrderId={id}
        requestNumber={task.request?.requestNumber}
      />
    </div>
  );
}
