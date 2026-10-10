"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageIcon,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Sparkles,
  User,
  Wrench,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { RejectRequestDialog } from "@/components/admin/reject-request-dialog";
import { DetailNotFound } from "@/components/shared/detail-not-found";
import { DueBadge } from "@/components/shared/due-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { QueryError } from "@/components/shared/query-error";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { getAttachmentUrl } from "@/lib/attachments";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { requestsService } from "@/services/requests.service";
import type { ServiceRequestDetail } from "@/types/api";

interface RequestReviewClientProps {
  id: string;
}

export function RequestReviewClient({ id }: RequestReviewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const hasRedirectedRef = React.useRef(false);
  const queryClient = useQueryClient();
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = React.useState(false);

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ServiceRequestDetail>({
    queryKey: ["requests", id],
    queryFn: () => requestsService.fetchRequestById(id),
    staleTime: 10000,
    retry: (failureCount, err) => {
      // Don't retry 404s
      const msg = getErrorMessage(err);
      if (
        msg.includes("404") ||
        msg.toLowerCase().includes("not found") ||
        (err &&
          typeof err === "object" &&
          "status" in err &&
          err.status === 404)
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  React.useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (
      request?.status === "APPROVED" &&
      (request.workOrder?.id || request.workOrderId) &&
      nextParam === "work-order"
    ) {
      hasRedirectedRef.current = true;
      const targetWorkOrderId = request.workOrder?.id || request.workOrderId;
      router.replace(`/admin/work-orders/${targetWorkOrderId}`);
    }
  }, [request, nextParam, router]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      return adminService.reviewRequest(id, {
        decision: "APPROVE",
      });
    },
    onSuccess: async () => {
      notify.success(
        messages.dispatch.approved.title,
        messages.dispatch.approved.description,
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin", "dispatch-queue"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["requests", id],
      });

      try {
        const freshRequest = await queryClient.fetchQuery<ServiceRequestDetail>(
          {
            queryKey: ["requests", id],
            queryFn: () => requestsService.fetchRequestById(id),
          },
        );

        const workOrderId =
          freshRequest.workOrder?.id || freshRequest.workOrderId;
        if (workOrderId) {
          router.push(`/admin/work-orders/${workOrderId}`);
        } else {
          router.push("/admin/work-orders");
        }
      } catch {
        router.push("/admin/work-orders");
      }
    },
    onError: async () => {
      await refetch();
    },
    onSettled: () => {
      setApproveDialogOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-muted animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-48 w-full bg-muted rounded-xl animate-pulse" />
            <div className="h-36 w-full bg-muted rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-64 w-full bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Handle 404 or missing
  const errorMessage = error ? getErrorMessage(error) : "";
  const is404 =
    !request &&
    (errorMessage.includes("404") ||
      errorMessage.toLowerCase().includes("not found") ||
      (error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404));

  if (is404) {
    return (
      <DetailNotFound
        title="Request not found"
        description="The service request you are looking for does not exist or may have been deleted."
        backHref="/admin/dispatch"
        backLabel="Back to queue"
      />
    );
  }

  if (isError || !request) {
    return (
      <QueryError
        error={error}
        onRetry={() => refetch()}
        title="Failed to load service request"
      />
    );
  }

  const isSubmitted = request.status === "SUBMITTED";
  const isApproved = request.status === "APPROVED";
  const isRejected = request.status === "REJECTED";
  const isHighPriority =
    request.priority === "HIGH" ||
    (request as { isPremium?: boolean }).isPremium;

  const requestId = request.id || (request as { _id?: string })._id || id;
  const requestNumber =
    request.requestNumber ||
    (requestId ? `#${requestId.slice(0, 8)}` : `#${id.slice(0, 8)}`);

  const workOrder = request.workOrder;
  const workOrderId = workOrder?.id || request.workOrderId;

  const categoryName = request.category?.name || "General Service";
  const requiredSkill = request.category?.skillId;

  // Normalize attachments
  const attachments = (request.attachments || [])
    .map((att, idx) => {
      const url = getAttachmentUrl(att);
      if (!url) return null;
      const fileName =
        typeof att === "object" && att !== null && "fileName" in att
          ? String((att as { fileName?: string }).fileName)
          : `Attachment ${idx + 1}`;
      const id =
        typeof att === "object" && att !== null && "id" in att
          ? String((att as { id?: string }).id)
          : `att-${idx}`;
      return { id, url, fileName };
    })
    .filter((item): item is { id: string; url: string; fileName: string } =>
      Boolean(item),
    );

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/dispatch"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 gap-1 text-muted-foreground hover:text-foreground text-xs",
          )}
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to dispatch queue</span>
        </Link>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Header */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-mono text-lg font-bold text-charcoal-900 dark:text-charcoal-100">
                      {requestNumber}
                    </h1>
                    <StatusBadge status={request.status} />
                    <PriorityBadge priority={request.priority} />
                    {isSubmitted && request.reviewDueAt && (
                      <DueBadge
                        reviewDueAt={request.reviewDueAt}
                        status="SUBMITTED"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted on {safeFormatDateTime(request.createdAt)}
                  </p>
                </div>

                {isHighPriority && (
                  <Badge
                    variant="outline"
                    className="self-start sm:self-auto gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-xs px-2.5 py-1"
                  >
                    <Sparkles className="size-3 text-amber-500" />
                    <span>Priority Review</span>
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap text-muted-foreground">
                <span className="font-medium text-foreground">Category:</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  <Wrench className="size-3 mr-1 text-primary" />
                  {categoryName}
                </Badge>
                {requiredSkill && (
                  <span className="text-[11px] text-muted-foreground">
                    (Required Skill ID:{" "}
                    <span className="font-mono">{requiredSkill}</span>)
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Request Info */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground">
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                  Title
                </span>
                <p className="font-semibold text-sm text-foreground">
                  {request.title || "No title provided"}
                </p>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                  Description
                </span>
                <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/60">
                  {request.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/60">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Preferred Schedule
                  </span>
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>
                      {request.preferredAt
                        ? safeFormatDateTime(request.preferredAt)
                        : request.preferredDate
                          ? safeFormatDate(request.preferredDate)
                          : "No preference specified"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Service Address
                  </span>
                  <div className="flex items-center gap-1.5 text-foreground font-medium">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>{request.address || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Customer Details */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Customer Name
                  </span>
                  <span className="font-semibold text-foreground">
                    {request.customer?.name || "Not provided"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Email
                  </span>
                  {request.customer?.email ? (
                    <a
                      href={`mailto:${request.customer.email}`}
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <Mail className="size-3" />
                      <span>{request.customer.email}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Phone
                  </span>
                  {request.customer?.phone ? (
                    <a
                      href={`tel:${request.customer.phone}`}
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <Phone className="size-3" />
                      <span>{request.customer.phone}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Attachments */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="size-4 text-primary" />
                <span>Attachments ({attachments.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {attachments.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No attachments provided for this service request.
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
        </div>

        {/* Right Column (Sticky Action Center) */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-panel/50 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" />
                <span>Action Center</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {isSubmitted
                  ? "Make an approval or rejection decision for this request."
                  : `Current request status is ${request.status}.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              {/* SUBMITTED Status */}
              {isSubmitted && (
                <div className="space-y-3">
                  {isHighPriority && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                      <Info className="size-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <span>
                        High priority and premium requests should be reviewed
                        promptly to meet SLAs.
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    <Button
                      type="button"
                      variant="default"
                      className="w-full justify-center gap-2 font-semibold shadow-xs"
                      disabled={approveMutation.isPending}
                      onClick={() => setApproveDialogOpen(true)}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      <span>Approve and create work order</span>
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full justify-center gap-2 font-semibold shadow-xs"
                      disabled={approveMutation.isPending}
                      onClick={() => setRejectModalOpen(true)}
                    >
                      <XCircle className="size-4" />
                      <span>Reject request</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* APPROVED Status */}
              {isApproved && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <div className="space-y-0.5">
                      <span className="font-semibold block">
                        Request Approved
                      </span>
                      <span>
                        This service request has been approved and converted to
                        a work order.
                      </span>
                    </div>
                  </div>

                  {workOrderId ? (
                    <Link
                      href={`/admin/work-orders/${workOrderId}`}
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "w-full justify-center gap-2 font-semibold",
                      )}
                    >
                      <span>Open work order</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center italic py-2">
                      Work order reference is pending generation.
                    </p>
                  )}
                </div>
              )}

              {/* REJECTED Status */}
              {isRejected && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-destructive font-semibold">
                      <ShieldAlert className="size-4" />
                      <span>Rejection Reason</span>
                    </div>
                    <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap">
                      {request.rejectionReason ||
                        "No specific rejection reason provided."}
                    </p>
                    {request.reviewedAt && (
                      <p className="text-[11px] text-muted-foreground pt-1 border-t border-destructive/10">
                        Rejected on {safeFormatDateTime(request.reviewedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Any Other Status */}
              {!isSubmitted && !isApproved && !isRejected && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-muted-foreground">
                    This request is in{" "}
                    <span className="font-medium text-foreground">
                      {request.status}
                    </span>{" "}
                    state and does not require further dispatch review.
                  </p>
                  {workOrderId && (
                    <Link
                      href={`/admin/work-orders/${workOrderId}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "w-full justify-center gap-1.5 mt-2",
                      )}
                    >
                      <span>View Work Order</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Confirmation AlertDialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this request?</AlertDialogTitle>
            <AlertDialogDescription>
              Approving request{" "}
              <span className="font-mono font-medium text-foreground">
                {requestNumber}
              </span>{" "}
              will create a new Work Order ready for technician assignment and
              visit scheduling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="gap-2"
            >
              {approveMutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              <span>
                {approveMutation.isPending
                  ? "Approving..."
                  : "Confirm Approval"}
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Controlled Rejection Dialog Modal */}
      <RejectRequestDialog
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        requestId={id}
        requestNumber={request.requestNumber || requestNumber}
      />
    </div>
  );
}
