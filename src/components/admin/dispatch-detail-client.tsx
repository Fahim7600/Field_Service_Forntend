"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
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

import { RejectRequestDialog } from "@/components/admin/reject-request-dialog";
import { ScheduleAssignCard } from "@/components/admin/schedule-assign-card";
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
import { safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { requestsService } from "@/services/requests.service";
import type { ServiceRequestDetail } from "@/types/api";

interface DispatchDetailClientProps {
  id: string;
}

export function DispatchDetailClient({ id }: DispatchDetailClientProps) {
  const queryClient = useQueryClient();
  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);

  const {
    data: request,
    isLoading,
    isError,
    error,
  } = useQuery<ServiceRequestDetail>({
    queryKey: ["requests", id],
    queryFn: () => requestsService.fetchRequestById(id),
    staleTime: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      return adminService.reviewRequest(id, {
        decision: "APPROVE",
      });
    },
    onSuccess: async () => {
      toast.success("Service request approved and Work Order generated!");
      await queryClient.invalidateQueries({ queryKey: ["requests", id] });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "dispatch-queue"],
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

  if (isError || !request) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load service request details
            </h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The request could not be found or you do not have permission to view it."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/dispatch"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Dispatch</span>
            </Link>
            <Button size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSubmitted = request.status === "SUBMITTED";
  const isApproved = request.status === "APPROVED";
  const isRejected = request.status === "REJECTED";
  const isHighPriority = request.priority === "HIGH";
  const workOrder = request.workOrder;
  const workOrderId = workOrder?.id || request.workOrderId;

  // Extract category and skill ID
  const categoryName = request.category?.name || "General Service";
  const skillId = request.category?.skillId || request.categoryId;

  // Normalize attachments array
  const attachments = (request.attachments || []).map((att) => {
    if (typeof att === "string") {
      return { url: att, fileName: "Attachment" };
    }
    return {
      id: att.id,
      url: att.url || att.fileUrl || "",
      fileName: att.fileName || "Attachment image",
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dispatch"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to Queue</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg font-bold text-foreground">
                Request #{request.requestNumber || request.id.slice(0, 8)}
              </h1>
              <StatusBadge status={request.status} />
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
              Submitted on {safeFormatDateTime(request.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Details) + Right Column (Action Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Request Details & Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Header Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold">
                  {request.title || "Service Request Summary"}
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
                  Problem Description
                </span>
                <p className="text-sm text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/50">
                  {request.description || "No description provided."}
                </p>
              </div>

              {/* Customer & Address Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="size-3.5 text-primary" />
                    Customer Details
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      {request.customer?.name || "Customer"}
                    </p>
                    {request.customer?.email && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Mail className="size-3" />
                        {request.customer.email}
                      </p>
                    )}
                    {request.customer?.phone && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="size-3" />
                        {request.customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" />
                    Service Location
                  </span>
                  <div className="text-xs space-y-1">
                    <p className="font-medium text-foreground">
                      {request.address || "Address not provided"}
                    </p>
                    {request.preferredAt && (
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="size-3" />
                        Preferred: {safeFormatDateTime(request.preferredAt)}
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Attachments & Media ({attachments.length})</span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {attachments.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No images or documents attached to this request.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att, idx) => (
                    <a
                      key={att.id || att.url || idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-video overflow-hidden rounded-lg border border-border bg-muted/40 transition-all hover:ring-2 hover:ring-primary/50"
                    >
                      <Image
                        src={att.url}
                        alt={att.fileName || `Attachment ${idx + 1}`}
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
        </div>

        {/* Right Column: Action Center */}
        <div className="space-y-6">
          {/* Status: SUBMITTED -> Approval / Rejection Actions */}
          {isSubmitted && (
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <CardHeader className="border-b border-border/80 bg-panel/50 pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>Dispatch Review Action</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Review this customer request to approve into a Work Order or
                  reject with reasons.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-5">
                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={approveMutation.isPending}
                    onClick={() => approveMutation.mutate()}
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    <span>Approve & Create Work Order</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={approveMutation.isPending}
                    onClick={() => setRejectModalOpen(true)}
                  >
                    <XCircle className="size-4" />
                    <span>Reject Request</span>
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="border-t border-border/80 bg-panel/30 px-6 py-3 text-[11px] text-muted-foreground">
                Approval generates an official work order ready for technician
                scheduling.
              </CardFooter>
            </Card>
          )}

          {/* Status: APPROVED & Work Order Exists -> Schedule & Assign Card */}
          {isApproved && workOrderId && (
            <ScheduleAssignCard
              workOrderId={workOrderId}
              requestId={id}
              skillId={skillId}
              skillName={categoryName}
              preferredAt={request.preferredAt}
              customerAddress={request.address}
              existingVisitStart={workOrder?.visitStart}
              existingVisitEnd={workOrder?.visitEnd}
              existingTechnicianId={workOrder?.technicianId}
            />
          )}

          {/* Status: REJECTED Banner */}
          {isRejected && (
            <Alert
              variant="destructive"
              className="border-destructive/40 bg-destructive/5"
            >
              <ShieldAlert className="size-5 text-destructive" />
              <AlertTitle className="text-sm font-semibold">
                Request Rejected
              </AlertTitle>
              <AlertDescription className="space-y-2 pt-1 text-xs">
                <p>
                  <strong>Reason:</strong>{" "}
                  {request.rejectionReason || "No specific reason provided."}
                </p>
                {request.reviewedAt && (
                  <p className="text-[11px] text-muted-foreground">
                    Reviewed on {safeFormatDateTime(request.reviewedAt)}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* If already assigned or completed */}
          {!isSubmitted && !isApproved && !isRejected && (
            <Card className="border-border bg-card p-4">
              <CardContent className="space-y-3 p-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span className="font-semibold text-sm">
                    Status: {request.status}
                  </span>
                </div>
                {workOrderId && (
                  <p className="text-xs text-muted-foreground">
                    Linked Work Order:{" "}
                    <span className="font-mono font-medium text-foreground">
                      #{workOrderId.slice(0, 8)}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Controlled Rejection Dialog Modal */}
      <RejectRequestDialog
        open={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
        requestId={id}
        requestNumber={request.requestNumber}
      />
    </div>
  );
}
