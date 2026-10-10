"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  Trash2,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DetailNotFound } from "@/components/shared/detail-not-found";
import { QueryError } from "@/components/shared/query-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api-client";
import { getAttachmentUrl } from "@/lib/attachments";
import { formatSafeDateTime } from "@/lib/format-date";
import { messages, notify } from "@/lib/notify";
import { requestsService } from "@/services/requests.service";

export interface RequestDetailClientProps {
  id: string;
}

export function RequestDetailClient({ id }: RequestDetailClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = React.useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["service-request", id],
    queryFn: () => requestsService.fetchRequestById(id),
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: (requestId: string) =>
      requestsService.cancelServiceRequest(requestId),
    onSuccess: () => {
      notify.success(
        messages.requests.cancelled.title,
        messages.requests.cancelled.description,
      );
      queryClient.invalidateQueries({
        queryKey: ["customer-service-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["service-request", id] });
      setIsCancelConfirmOpen(false);
      router.push("/customer/requests");
      router.refresh();
    },
  });

  const handleCancelRequest = () => {
    cancelMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-36" />
        <Card className="border border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-28 w-full" />
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <DetailNotFound
          title="Service request not found"
          description="The requested service request could not be retrieved."
          backHref="/customer/requests"
          backLabel="Back to Requests"
        />
      );
    }
    return (
      <div className="max-w-xl mx-auto py-8">
        <QueryError
          error={error}
          onRetry={refetch}
          title="Unable to load service request"
        />
      </div>
    );
  }

  const isSubmittable =
    String(data.status).toUpperCase() === "SUBMITTED" ||
    String(data.status).toUpperCase() === "PENDING";

  const attachmentsList = (data.attachments || [])
    .map((att) => getAttachmentUrl(att))
    .filter((url): url is string => Boolean(url));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/customer/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to My Requests
        </Link>
      </div>

      {/* Main Request Header Card */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                  #{data.requestNumber || data.id.substring(0, 8)}
                </span>
                {data.priority && (
                  <Badge
                    variant={
                      String(data.priority).toUpperCase() === "HIGH"
                        ? "destructive"
                        : "secondary"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {data.priority} Priority
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-charcoal-900 pt-1">
                {data.title}
              </CardTitle>
            </div>
            <div className="shrink-0">
              <StatusBadge status={data.status} className="text-xs px-3 py-1" />
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Key Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-panel border border-border">
              <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                <Wrench className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                  Service Category
                </span>
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {data.category?.name || "Standard Service"}
                </p>
              </div>
            </div>

            {/* Preferred Schedule */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-panel border border-border">
              <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                <Calendar className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                  Preferred Appointment
                </span>
                <p className="text-xs font-bold text-charcoal-900 truncate">
                  {formatSafeDateTime(data.preferredDate || data.preferredAt)}
                </p>
              </div>
            </div>

            {/* Service Location */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-panel border border-border">
              <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                <MapPin className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                  Service Location
                </span>
                <p className="text-xs font-medium text-charcoal-800 line-clamp-2">
                  {data.address || "Address on file"}
                </p>
              </div>
            </div>

            {/* Submitted Date */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-panel border border-border">
              <div className="size-8 rounded-lg bg-card border border-border flex items-center justify-center text-brand-600 shrink-0 shadow-2xs">
                <Clock className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider block">
                  Date Submitted
                </span>
                <p className="text-xs font-medium text-charcoal-800">
                  {formatSafeDateTime(data.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Problem Description
            </h4>
            <div className="rounded-xl border border-border bg-panel p-4 text-xs text-charcoal-800 leading-relaxed whitespace-pre-wrap">
              {data.description || "No description provided."}
            </div>
          </div>

          {/* Attachments Section */}
          {attachmentsList.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Attached Photos ({attachmentsList.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {attachmentsList.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group rounded-xl overflow-hidden border border-border bg-panel aspect-square block shadow-2xs hover:border-brand-500 transition-colors"
                  >
                    <Image
                      src={url}
                      alt="Attachment Photo"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-charcoal-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <ExternalLink className="size-5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Cancellation Option (for SUBMITTED requests) */}
          {isSubmittable && (
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/5 p-4 rounded-xl border-amber-500/20">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-charcoal-900">
                  Need to make changes or cancel?
                </p>
                <p className="text-[11px] text-charcoal-600">
                  This request is awaiting dispatcher review. You can cancel it
                  now if your plans have changed.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="shrink-0 text-xs"
                disabled={cancelMutation.isPending}
                onClick={() => setIsCancelConfirmOpen(true)}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5 mr-1.5" />
                    Cancel Request
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        title="Cancel service request?"
        description="Are you sure you want to cancel this pending request? You can submit a new request at any time."
        confirmLabel="Cancel Request"
        variant="destructive"
        pending={cancelMutation.isPending}
        onConfirm={handleCancelRequest}
      />
    </div>
  );
}
