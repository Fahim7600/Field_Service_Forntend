"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Crown,
  ExternalLink,
  FileCheck2,
  FileText,
  History,
  ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Receipt,
  RefreshCw,
  Trash2,
  Upload,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CancelJobDialog } from "@/components/customer/cancel-job-dialog";
import { FeedbackCard } from "@/components/customer/feedback-card";
import { RescheduleJobDialog } from "@/components/customer/reschedule-job-dialog";
import { ImagePicker, type PickedImage } from "@/components/forms/image-picker";
import { UploadProgress } from "@/components/forms/upload-progress";
import { DetailNotFound } from "@/components/shared/detail-not-found";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { QueryError } from "@/components/shared/query-error";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { WorkProgressStepper } from "@/components/shared/work-progress-stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useActivePolling } from "@/hooks/use-active-polling";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { ApiError } from "@/lib/api-client";
import { getAttachmentUrl } from "@/lib/attachments";
import { formatRelative, safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { getDisplayStatus, isRequestEditable } from "@/lib/work-order-rules";
import { requestsService } from "@/services/requests.service";
import { workOrdersService } from "@/services/work-orders.service";
import type { CustomerRequestDetail } from "@/types/api";
import type { WorkOrder, WorkOrderStatusHistoryItem } from "@/types/work-order";

export interface RequestDetailClientProps {
  id: string;
}

export function RequestDetailClient({ id }: RequestDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isPremium } = usePremiumStatus();

  // Dialog state for cancelling/rescheduling the work order
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] =
    React.useState(false);

  // Selected new photos for upload while in SUBMITTED status
  const [newPhotos, setNewPhotos] = React.useState<PickedImage[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] =
    React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // Dialog state for deleting an attachment
  const [deleteAttachmentId, setDeleteAttachmentId] = React.useState<
    string | null
  >(null);
  const [isDeletingAttachment, setIsDeletingAttachment] = React.useState(false);

  // Dialog state for deleting the request
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // 1. Fetch Primary Service Request
  const {
    data: request,
    isLoading: isRequestLoading,
    isError: isRequestError,
    error: requestError,
    refetch: refetchRequest,
  } = useQuery<CustomerRequestDetail>({
    queryKey: ["customer", "request", id],
    queryFn: () => requestsService.fetchRequestById(id),
    staleTime: 15_000,
  });

  const workOrderId = request?.workOrder?.id;

  // Polling interval for active work order status
  const pollingInterval = useActivePolling(request?.workOrder?.status);

  // 2. Fetch Linked Work Order (if exists)
  const {
    data: workOrder,
    isLoading: isWorkOrderLoading,
    isError: isWorkOrderError,
    refetch: refetchWorkOrder,
  } = useQuery<WorkOrder>({
    queryKey: ["work-order", workOrderId],
    queryFn: () => workOrdersService.fetchWorkOrderById(workOrderId as string),
    enabled: Boolean(workOrderId),
    refetchInterval: pollingInterval,
    staleTime: 10_000,
  });

  // 3. Fetch Work Order Audit History Timeline (if work order exists)
  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery<WorkOrderStatusHistoryItem[]>({
    queryKey: ["work-order-history", workOrderId],
    queryFn: () =>
      workOrdersService.fetchWorkOrderHistory(workOrderId as string),
    enabled: Boolean(workOrderId),
    staleTime: 15_000,
  });

  // Mutation: Delete request
  const deleteRequestMutation = useMutation({
    mutationFn: () => requestsService.deleteRequest(id),
    onSuccess: () => {
      notify.success(
        messages.requests.cancelled.title,
        "Your pending service request has been removed.",
      );
      queryClient.invalidateQueries({ queryKey: ["customer", "requests"] });
      router.push("/customer/requests");
    },
  });

  // Upload New Photos to SUBMITTED request
  const handleUploadPhotos = async () => {
    if (newPhotos.length === 0) return;

    try {
      setIsUploadingAttachments(true);
      setUploadProgress(0);

      const files = newPhotos.map((p) => p.file);
      await requestsService.uploadAttachments(id, files, (percent) => {
        setUploadProgress(percent);
      });

      notify.success(
        "Photos added",
        `Successfully attached ${newPhotos.length} image(s).`,
      );
      setNewPhotos([]);
      queryClient.invalidateQueries({ queryKey: ["customer", "request", id] });
    } catch (err: unknown) {
      notify.fromError(err, "Failed to upload photos");
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  // Delete Attachment Confirmation
  const confirmDeleteAttachment = async () => {
    if (!deleteAttachmentId) return;

    try {
      setIsDeletingAttachment(true);
      await requestsService.deleteAttachment(id, deleteAttachmentId);
      notify.success("Attachment removed", "The photo has been removed.");
      setDeleteAttachmentId(null);
      queryClient.invalidateQueries({ queryKey: ["customer", "request", id] });
    } catch (err: unknown) {
      notify.fromError(err, "Failed to remove attachment");
    } finally {
      setIsDeletingAttachment(false);
    }
  };

  // Loading skeleton
  if (isRequestLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-5 w-32" />
        <Card className="border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          <Skeleton className="h-28 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  // 403 / 404 / Error state
  if (isRequestError || !request) {
    if (requestError instanceof ApiError && requestError.status === 404) {
      return (
        <DetailNotFound
          title="Service request not found"
          description="We could not find the requested service request or you do not have permission to view it."
          backHref="/customer/requests"
          backLabel="Back to Requests"
        />
      );
    }
    return (
      <div className="max-w-xl mx-auto py-6">
        <QueryError
          error={requestError}
          onRetry={refetchRequest}
          title="Unable to load service request"
        />
      </div>
    );
  }

  const isEditable = isRequestEditable(request.status);
  const isRejected = String(request.status).toUpperCase() === "REJECTED";
  const isSubmitted = String(request.status).toUpperCase() === "SUBMITTED";
  const displayStatus = getDisplayStatus(request);
  const activeWorkOrder: WorkOrder | null = workOrder
    ? workOrder
    : request.workOrder
      ? ({
          id: request.workOrder.id,
          workOrderNumber: request.workOrder.workOrderNumber,
          serviceRequestId: id,
          status: request.workOrder.status,
          assignedTechnicianId: request.workOrder.assignedTechnicianId,
          visitStart: request.workOrder.visitStart,
          scheduledDate:
            "scheduledDate" in request.workOrder
              ? (request.workOrder as { scheduledDate?: string | null })
                  .scheduledDate
              : null,
          technician: request.workOrder.technician,
          invoiceId: request.workOrder.invoiceId,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        } as WorkOrder)
      : null;

  // Extract valid attachments
  const attachmentsList = (request.attachments || [])
    .map((att, idx) => {
      const url = getAttachmentUrl(att);
      const idVal =
        typeof att === "object" && att !== null && "id" in att
          ? String((att as { id?: string }).id)
          : `att-${idx}`;
      const fileName =
        typeof att === "object" && att !== null && "fileName" in att
          ? String((att as { fileName?: string }).fileName)
          : `Photo ${idx + 1}`;
      return { id: idVal, url, fileName };
    })
    .filter((item): item is { id: string; url: string; fileName: string } =>
      Boolean(item.url),
    );

  const technicianName =
    activeWorkOrder?.technician?.name ||
    (activeWorkOrder?.technician &&
    "user" in activeWorkOrder.technician &&
    typeof activeWorkOrder.technician.user === "object" &&
    activeWorkOrder.technician.user !== null &&
    "name" in activeWorkOrder.technician.user
      ? (activeWorkOrder.technician.user as { name: string }).name
      : null) ||
    (activeWorkOrder?.assignedTechnicianId ? "Assigned Technician" : null);

  const isCompletedJob = ["COMPLETED", "INVOICED", "PAID", "CLOSED"].includes(
    String(activeWorkOrder?.status || "").toUpperCase(),
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/customer/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Requests</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Main Request & Progress Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Header Card */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-900">
                      #{request.requestNumber || request.id.substring(0, 8)}
                    </span>
                    <PriorityBadge priority={request.priority || "NORMAL"} />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-foreground pt-1">
                    {request.title}
                  </CardTitle>
                </div>
                <div className="shrink-0">
                  <StatusBadge
                    status={displayStatus}
                    className="text-xs px-3 py-1"
                  />
                </div>
              </div>
            </CardHeader>

            <Separator />

            {/* 2. Banner / Stepper based on state */}
            <CardContent className="pt-6 space-y-6">
              {/* Stepper or Cancellation card if work order exists */}
              {activeWorkOrder?.status === "CANCELLED" ? (
                <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <XCircle className="size-4" />
                    <span>This Job Was Cancelled</span>
                  </div>
                  {history?.find((h) => h.toStatus === "CANCELLED")
                    ?.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      Cancelled on{" "}
                      {safeFormatDateTime(
                        history.find((h) => h.toStatus === "CANCELLED")
                          ?.createdAt,
                      )}
                    </p>
                  )}
                  {activeWorkOrder.cancelReason ||
                  history?.find((h) => h.toStatus === "CANCELLED")?.reason ? (
                    <p className="text-xs text-foreground bg-background p-2.5 rounded-lg border border-border/60">
                      <span className="font-semibold text-muted-foreground">
                        Reason:{" "}
                      </span>
                      {activeWorkOrder.cancelReason ||
                        history?.find((h) => h.toStatus === "CANCELLED")
                          ?.reason}
                    </p>
                  ) : null}
                </div>
              ) : activeWorkOrder ? (
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Execution Milestone Tracker
                  </span>
                  <WorkProgressStepper status={activeWorkOrder.status} />
                </div>
              ) : isSubmitted ? (
                /* Submitted info banner */
                <Alert className="border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200">
                  <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="font-semibold text-xs">
                    Waiting for Dispatcher Review
                  </AlertTitle>
                  <AlertDescription className="text-xs pt-0.5 space-y-1">
                    <p>
                      Our dispatch team is currently assessing your service
                      requirements and technician availability.
                    </p>
                    {String(request.priority).toUpperCase() === "HIGH" && (
                      <p className="font-medium text-amber-700 dark:text-amber-300">
                        Priority requests are prioritized in the dispatch review
                        queue.
                        {request.reviewDueAt
                          ? ` Estimated review: ${formatRelative(request.reviewDueAt)}.`
                          : ""}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              ) : isRejected ? (
                /* Rejected alert */
                <Alert variant="destructive">
                  <XCircle className="size-4" />
                  <AlertTitle className="font-semibold text-xs">
                    Request Not Approved
                  </AlertTitle>
                  <AlertDescription className="text-xs pt-0.5 space-y-2">
                    <p>
                      <strong>Reason: </strong>
                      {request.rejectionReason ||
                        "Unable to service this request at the selected location or timeframe."}
                    </p>
                    <div className="pt-1">
                      <Link
                        href="/customer/requests/new"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "xs" }),
                          "border-destructive text-destructive hover:bg-destructive/10",
                        )}
                      >
                        Book a new service request
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* 3. Request Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80">
                  <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                    <Wrench className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Service Category
                    </span>
                    <p className="text-xs font-bold text-foreground truncate">
                      {request.category?.name || "General Service"}
                    </p>
                  </div>
                </div>

                {/* Preferred Schedule */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80">
                  <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                    <Calendar className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Preferred Appointment
                    </span>
                    <p className="text-xs font-bold text-foreground truncate">
                      {safeFormatDateTime(
                        request.preferredDate || request.preferredAt,
                      )}
                    </p>
                  </div>
                </div>

                {/* Service Location */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80">
                  <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                    <MapPin className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Service Location
                    </span>
                    <p className="text-xs font-medium text-foreground line-clamp-2">
                      {request.address || "Address not provided"}
                    </p>
                  </div>
                </div>

                {/* Submitted Date */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/80">
                  <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                    <Clock className="size-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Date Submitted
                    </span>
                    <p className="text-xs font-medium text-foreground">
                      {safeFormatDateTime(request.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" />
                  Problem Description
                </h4>
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {request.description || "No description provided."}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Attached Photos Card */}
          <Card className="border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Attached Photos ({attachmentsList.length})</span>
                </CardTitle>
                {isEditable && (
                  <Badge variant="outline" className="text-[10px]">
                    Editable
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">
                {isEditable
                  ? "You can add or remove photo attachments while your request is pending review."
                  : "Photos provided with this service booking."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* Existing Photos Grid */}
              {attachmentsList.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No photos attached to this service request.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachmentsList.map((att) => (
                    <div
                      key={att.id}
                      className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-muted/40"
                    >
                      <Image
                        src={att.url}
                        alt={att.fileName}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center gap-2">
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex size-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                          aria-label="View full size image"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>

                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => setDeleteAttachmentId(att.id)}
                            className="flex size-7 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                            aria-label={`Delete ${att.fileName}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add More Photos while SUBMITTED */}
              {isEditable && (
                <div className="pt-4 border-t border-border/60 space-y-3">
                  <span className="text-xs font-semibold text-foreground block">
                    Add More Photos (Max {5 - attachmentsList.length} remaining)
                  </span>

                  <ImagePicker
                    value={newPhotos}
                    onChange={setNewPhotos}
                    maxFiles={5}
                    existingCount={attachmentsList.length}
                    disabled={isUploadingAttachments}
                  />

                  {isUploadingAttachments && (
                    <UploadProgress
                      progress={uploadProgress}
                      label="Uploading photos..."
                    />
                  )}

                  {newPhotos.length > 0 && (
                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="default"
                        disabled={isUploadingAttachments}
                        onClick={handleUploadPhotos}
                        className="gap-1.5 text-xs font-semibold shadow-xs"
                      >
                        {isUploadingAttachments ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="size-3.5" />
                            <span>Upload Selected ({newPhotos.length})</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Status Timeline (when history is available) */}
          {activeWorkOrder && (
            <Card className="border border-border bg-card shadow-xs">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <History className="size-4 text-primary" />
                  <span>Job Timeline History</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Recorded operational transitions and milestones.
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
                    <p>Status timeline history is currently unavailable.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchHistory()}
                      className="h-7 text-xs"
                    >
                      Retry Timeline
                    </Button>
                  </div>
                ) : (
                  <StatusTimeline history={history || []} />
                )}
              </CardContent>
            </Card>
          )}

          {/* 5.5 Inline Rate Your Service Feedback Card */}
          {workOrderId && (
            <FeedbackCard
              workOrderId={workOrderId}
              workOrderStatus={activeWorkOrder?.status}
              onRequestRefresh={() => {
                refetchRequest();
                refetchWorkOrder();
              }}
            />
          )}
        </div>

        {/* Right Column (Sidebar Cards: Job, Service Report, Billing, Actions) */}
        <div className="lg:sticky lg:top-6 space-y-4">
          {/* 6. Job Card (when work order exists) */}
          {workOrderId && (
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/80 bg-muted/30 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Wrench className="size-4 text-primary" />
                  <span>Job Assignment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                {isWorkOrderLoading && !activeWorkOrder ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full rounded" />
                    <Skeleton className="h-8 w-full rounded" />
                  </div>
                ) : isWorkOrderError && !activeWorkOrder ? (
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>Unable to load live job assignment details.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchWorkOrder()}
                      className="h-7 text-xs"
                    >
                      <RefreshCw className="size-3 mr-1" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Assigned Technician
                      </span>
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-brand-600 shrink-0" />
                        <span>
                          {technicianName || "Technician will be assigned soon"}
                        </span>
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                        Confirmed Visit Window
                      </span>
                      <p className="font-medium text-foreground">
                        {activeWorkOrder?.visitStart
                          ? safeFormatDateTime(activeWorkOrder.visitStart)
                          : "Visit not scheduled yet"}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 7. Service Report Card (read-only if report exists) */}
          {activeWorkOrder?.serviceReport && (
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/80 bg-emerald-50/40 dark:bg-emerald-950/20 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <FileCheck2 className="size-4 text-emerald-600" />
                  <span>Service Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                {activeWorkOrder.serviceReport.workDone && (
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                      Work Completed
                    </span>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {activeWorkOrder.serviceReport.workDone}
                    </p>
                  </div>
                )}

                {typeof activeWorkOrder.serviceReport.hoursSpent ===
                  "number" && (
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                      Labor Duration
                    </span>
                    <p className="font-semibold text-foreground">
                      {activeWorkOrder.serviceReport.hoursSpent} hours
                    </p>
                  </div>
                )}

                {Boolean(activeWorkOrder.serviceReport.partsUsed) && (
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                      Parts Utilized
                    </span>
                    <p className="text-muted-foreground">
                      {typeof activeWorkOrder.serviceReport.partsUsed ===
                      "string"
                        ? activeWorkOrder.serviceReport.partsUsed
                        : Array.isArray(activeWorkOrder.serviceReport.partsUsed)
                          ? activeWorkOrder.serviceReport.partsUsed
                              .map((p) =>
                                typeof p === "object" &&
                                p !== null &&
                                "partName" in p
                                  ? `${(p as { partName: string }).partName}${
                                      "quantity" in p
                                        ? ` (x${(p as { quantity: number }).quantity})`
                                        : ""
                                    }`
                                  : String(p),
                              )
                              .join(", ")
                          : JSON.stringify(
                              activeWorkOrder.serviceReport.partsUsed,
                            )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 8. Billing Card (for completed/invoiced jobs) */}
          {isCompletedJob && (
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/80 bg-muted/30 pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Receipt className="size-4 text-primary" />
                  <span>Invoices &amp; Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Service has been completed for this work order. Review your
                  billing invoice and payment receipts.
                </p>
                <Link
                  href="/customer/invoices"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-full justify-center text-xs font-semibold",
                  )}
                >
                  <Receipt className="size-3.5 mr-1.5" />
                  <span>View Invoices</span>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 9. Actions Card */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/80 bg-muted/30 pb-3">
              <CardTitle className="text-sm font-bold text-foreground">
                Request Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {/* If work order exists */}
              {activeWorkOrder ? (
                <>
                  {activeWorkOrder.status === "SCHEDULED" && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsRescheduleDialogOpen(true)}
                        className="w-full justify-center gap-1.5 text-xs font-semibold"
                      >
                        <RefreshCw className="size-3.5" />
                        <span>Reschedule Visit</span>
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsCancelDialogOpen(true)}
                        className="w-full justify-center gap-1.5 text-xs font-semibold"
                      >
                        <XCircle className="size-3.5" />
                        <span>Cancel Job</span>
                      </Button>
                    </div>
                  )}

                  {(activeWorkOrder.status === "APPROVED" ||
                    activeWorkOrder.status === "ASSIGNED") && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsCancelDialogOpen(true)}
                        className="w-full justify-center gap-1.5 text-xs font-semibold"
                      >
                        <XCircle className="size-3.5" />
                        <span>Cancel Job</span>
                      </Button>
                      <p className="text-[11px] text-muted-foreground italic text-center">
                        Your visit has not been scheduled yet.
                      </p>
                    </div>
                  )}

                  {(activeWorkOrder.status === "ARRIVED" ||
                    activeWorkOrder.status === "IN_PROGRESS") && (
                    <p className="text-xs text-muted-foreground italic py-1">
                      Work has started, so this job can no longer be changed or
                      cancelled.
                    </p>
                  )}

                  {isCompletedJob && (
                    <p className="text-xs text-muted-foreground italic py-1">
                      This service job has been completed.
                    </p>
                  )}

                  {activeWorkOrder.status === "CANCELLED" && (
                    <p className="text-xs text-muted-foreground italic py-1">
                      This job was cancelled.
                    </p>
                  )}
                </>
              ) : isEditable ? (
                /* SUBMITTED Request actions */
                <>
                  <Link
                    href={`/customer/requests/${id}/edit`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full justify-center gap-1.5 text-xs font-semibold",
                    )}
                  >
                    <Pencil className="size-3.5" />
                    <span>Edit Request</span>
                  </Link>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleteRequestMutation.isPending}
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full justify-center gap-1.5 text-xs font-semibold"
                  >
                    {deleteRequestMutation.isPending ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="size-3.5" />
                        <span>Delete Request</span>
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic py-1">
                  This request has been reviewed and can no longer be edited or
                  deleted.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Collapsible Cancellation & Reschedule Policy */}
          <details className="group border border-border/70 rounded-xl p-3 bg-muted/20 text-xs text-muted-foreground transition-all">
            <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
              <span>Cancellation &amp; Reschedule Policy</span>
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180 text-muted-foreground" />
            </summary>
            <div className="pt-2.5 space-y-1.5 border-t border-border/40 mt-2 text-[11px] leading-relaxed">
              <p>
                • <strong>Free for Premium:</strong> Active Premium members can
                reschedule or cancel any time before technician arrival.
              </p>
              <p>
                • <strong>Free Early Notice:</strong> Standard bookings are free
                to modify if changed more than 24 hours prior to visit.
              </p>
              <p>
                • <strong>Late Modification Fee:</strong> Changes within 24
                hours incur an estimated $5.00 late fee billed via invoice.
              </p>
              <p>
                • <strong>After Arrival:</strong> No modifications are allowed
                once a technician arrives on site.
              </p>
              {isPremium !== true && (
                <div className="pt-1">
                  <Link
                    href="/customer/premium"
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Crown className="size-3 text-brand-600" />
                    <span>Upgrade to Premium for free changes →</span>
                  </Link>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Cancel Job Dialog */}
      {activeWorkOrder && (
        <CancelJobDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          workOrder={activeWorkOrder}
          isPremium={isPremium}
          requestId={id}
        />
      )}

      {/* Reschedule Job Dialog */}
      {activeWorkOrder && (
        <RescheduleJobDialog
          open={isRescheduleDialogOpen}
          onOpenChange={setIsRescheduleDialogOpen}
          workOrder={activeWorkOrder}
          isPremium={isPremium}
          requestId={id}
        />
      )}

      {/* AlertDialog for Request Deletion */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this service request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Request #
              {request.requestNumber || id.slice(0, 8)}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRequestMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRequestMutation.mutate()}
              disabled={deleteRequestMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRequestMutation.isPending
                ? "Deleting..."
                : "Delete Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog for Attachment Deletion */}
      <AlertDialog
        open={Boolean(deleteAttachmentId)}
        onOpenChange={(open) => !open && setDeleteAttachmentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove photo attachment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo from your request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAttachment}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAttachment}
              disabled={isDeletingAttachment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingAttachment ? "Removing..." : "Remove Photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
