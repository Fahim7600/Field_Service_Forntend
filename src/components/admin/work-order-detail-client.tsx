"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  History,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { WorkOrderDispatchActions } from "@/components/admin/work-order-dispatch-actions";
import { StatusTimeline } from "@/components/shared/status-timeline";
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
import { getErrorMessage } from "@/lib/api-client";
import { safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workOrdersService } from "@/services/work-orders.service";
import type { WorkOrder, WorkOrderStatusHistoryItem } from "@/types/work-order";

interface WorkOrderDetailClientProps {
  id: string;
}

export function WorkOrderDetailClient({ id }: WorkOrderDetailClientProps) {
  // Main work order query
  const {
    data: workOrder,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<WorkOrder>({
    queryKey: ["admin", "work-orders", id],
    queryFn: () => workOrdersService.fetchWorkOrderById(id),
    staleTime: 10000,
    retry: (failureCount, err) => {
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

  // History query (failures must not break the page)
  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery<WorkOrderStatusHistoryItem[]>({
    queryKey: ["admin", "work-orders", id, "history"],
    queryFn: () => workOrdersService.fetchWorkOrderHistory(id),
    staleTime: 10000,
    enabled: Boolean(workOrder),
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const errorMessage = error ? getErrorMessage(error) : "";
  const is404 =
    !workOrder &&
    (errorMessage.includes("404") ||
      errorMessage.toLowerCase().includes("not found") ||
      (error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404));

  if (is404) {
    return (
      <Card className="border-border bg-card p-8 text-center max-w-lg mx-auto shadow-xs">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Work order not found
            </h2>
            <p className="text-xs text-muted-foreground">
              The work order with ID #{id.slice(0, 8)} does not exist or has
              been removed.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/admin/work-orders"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Work Orders</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !workOrder) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-8 text-center max-w-lg mx-auto shadow-xs">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-destructive">
              Failed to load work order
            </h2>
            <p className="text-xs text-muted-foreground">
              {errorMessage ||
                "An unexpected error occurred while loading this work order."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/work-orders"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Work Orders</span>
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

  const requestId =
    workOrder.serviceRequestId || workOrder.requestId || workOrder.request?.id;

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/work-orders"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to Work Orders</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-lg font-bold text-charcoal-900 dark:text-charcoal-100">
                Work Order{" "}
                {workOrder.workOrderNumber || `#${workOrder.id.slice(0, 8)}`}
              </h1>
              <StatusBadge status={workOrder.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Created on {safeFormatDateTime(workOrder.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Details) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer and Location */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Customer & Location</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Customer Name
                  </span>
                  <span className="font-semibold text-foreground">
                    {workOrder.customer?.name || "Not provided"}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Email
                  </span>
                  {workOrder.customer?.email ? (
                    <a
                      href={`mailto:${workOrder.customer.email}`}
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <Mail className="size-3" />
                      <span>{workOrder.customer.email}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Phone
                  </span>
                  {workOrder.customer?.phone ? (
                    <a
                      href={`tel:${workOrder.customer.phone}`}
                      className="text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <Phone className="size-3" />
                      <span>{workOrder.customer.phone}</span>
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
                <div className="flex items-center gap-1.5 text-foreground font-medium">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                  <span>
                    {workOrder.request?.address || "Address not provided"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Request Summary */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wrench className="size-4 text-primary" />
                  <span>Service Request Summary</span>
                </CardTitle>
                {requestId && (
                  <Link
                    href={`/admin/dispatch/${requestId}`}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "text-xs gap-1 font-semibold text-primary hover:text-primary/80 h-7 px-2",
                    )}
                  >
                    <span>View original request</span>
                    <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-mono font-semibold text-foreground">
                  {workOrder.request?.requestNumber
                    ? `Request #${workOrder.request.requestNumber}`
                    : requestId
                      ? `Request #${requestId.slice(0, 8)}`
                      : "Linked Service Request"}
                </span>
                {workOrder.request?.category?.name && (
                  <Badge variant="secondary" className="font-medium text-xs">
                    {workOrder.request.category.name}
                  </Badge>
                )}
              </div>

              {workOrder.request?.title && (
                <p className="font-semibold text-sm text-foreground">
                  {workOrder.request.title}
                </p>
              )}

              {workOrder.request?.description && (
                <p className="text-charcoal-800 dark:text-charcoal-200 leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border border-border/60">
                  {workOrder.request.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Technician and Visit Window */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span>Technician & Visit Window</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Assigned Technician
                  </span>
                  {workOrder.technician ? (
                    <div className="space-y-0.5">
                      <p className="font-semibold text-foreground text-sm">
                        {workOrder.technician.name}
                      </p>
                      {workOrder.technician.email && (
                        <p className="text-muted-foreground text-xs">
                          {workOrder.technician.email}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      Not assigned yet
                    </p>
                  )}
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1">
                    Visit Schedule
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span>
                        {workOrder.visitStart
                          ? safeFormatDateTime(workOrder.visitStart)
                          : "Not scheduled yet"}
                      </span>
                    </div>
                    {workOrder.visitEnd && (
                      <p className="text-[11px] text-muted-foreground pl-5">
                        End: {safeFormatDateTime(workOrder.visitEnd)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Dispatch Guidance & History Timeline) */}
        <div className="space-y-6">
          {/* Dispatch Guidance Card */}
          <WorkOrderDispatchActions workOrder={workOrder} />

          {/* Status Timeline History Card */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="size-4 text-primary" />
                <span>Status History</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Chronological log of status transitions for this work order.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isHistoryLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-12 w-full rounded-lg" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              ) : isHistoryError ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive space-y-2">
                  <p>Failed to load transition history.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchHistory()}
                    className="h-7 text-xs border-destructive/30 text-destructive"
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
      </div>
    </div>
  );
}
