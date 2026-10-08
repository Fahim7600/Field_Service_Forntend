"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  History,
  Inbox,
  PlayCircle,
  Star,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { formatSafeDate, formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { technicianService } from "@/services/technician.service";
import type { WorkOrderSummary } from "@/types/api";

export function TechnicianTasksClient() {
  const { filters, updateFilters } = useUrlFilters();

  const activeTab = (filters.tab as string) || "active";
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["technician", "tasks", { tab: activeTab, page, limit }],
    queryFn: async () => {
      if (activeTab === "pending") {
        return technicianService.fetchWorkOrders({
          status: "ASSIGNED",
          page,
          limit,
        });
      }
      if (activeTab === "history") {
        return technicianService.fetchWorkOrders({
          status: "COMPLETED",
          page,
          limit,
        });
      }
      // "active" tab: tasks currently underway or scheduled
      return technicianService.fetchMyAssignedTasks({
        page,
        limit,
      });
    },
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const rawItems = extractArray<WorkOrderSummary>(data);
  // If in active tab, filter out ASSIGNED since they belong in Pending tab
  const items = React.useMemo(() => {
    if (activeTab === "active") {
      return rawItems.filter((item) => item.status !== "ASSIGNED");
    }
    return rawItems;
  }, [rawItems, activeTab]);

  const pagination = data?.pagination;

  const columns: ColumnDef<WorkOrderSummary>[] = [
    {
      id: "workOrder",
      header: "Job / Request #",
      cell: (item) => {
        const isHighPriority = item.request?.priority === "HIGH";

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-bold text-charcoal-900 dark:text-charcoal-100">
                #{item.id.slice(0, 8)}
              </span>
              {isHighPriority && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0 text-[10px]"
                >
                  <Star className="size-2.5 fill-amber-500 text-amber-500" />
                  HIGH
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="font-mono text-[11px] opacity-80">
                {item.request?.requestNumber || "SR-Pending"}
              </span>
              {item.request?.title && (
                <>
                  <span>•</span>
                  <span className="line-clamp-1 max-w-[180px]">
                    {item.request.title}
                  </span>
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Category",
      cell: (item) => (
        <Badge variant="secondary" className="font-medium text-xs gap-1">
          <Wrench className="size-3 text-primary" />
          {item.request?.category?.name || "General Service"}
        </Badge>
      ),
    },
    {
      id: "schedule",
      header: "Visit Window",
      cell: (item) => {
        if (!item.visitStart) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Not scheduled yet
            </span>
          );
        }

        return (
          <div className="flex flex-col text-xs text-muted-foreground">
            <span className="font-medium text-charcoal-900 dark:text-charcoal-100 flex items-center gap-1">
              <Calendar className="size-3 text-primary" />
              {formatSafeDate(item.visitStart)}
            </span>
            <span className="text-[11px]">
              {formatSafeDateTime(item.visitStart, "h:mm a")} -{" "}
              {item.visitEnd
                ? formatSafeDateTime(item.visitEnd, "h:mm a")
                : "TBD"}
            </span>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
            {item.customer?.name || "Customer"}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (item) => {
        const isPending = item.status === "ASSIGNED";
        const isInProgress = item.status === "IN_PROGRESS";

        return (
          <Link
            href={`/technician/tasks/${item.id}`}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: isPending || isInProgress ? "default" : "outline",
              }),
              "text-xs h-8 gap-1.5 shadow-2xs",
            )}
          >
            <span>
              {isPending
                ? "Review Job"
                : isInProgress
                  ? "Resume Work"
                  : "View Task"}
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabbed Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <Tabs
          value={activeTab}
          onValueChange={(val: unknown) =>
            updateFilters({ tab: String(val ?? "active"), page: 1 })
          }
        >
          <TabsList className="bg-muted/60 p-1 border border-border">
            <TabsTrigger value="active" className="gap-1.5">
              <PlayCircle className="size-3.5" />
              <span>Active Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              <Briefcase className="size-3.5" />
              <span>Pending Acceptance</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="size-3.5" />
              <span>Completed History</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3.5" />
          <span>Real-time assigned dispatch queue</span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && !data && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load assigned tasks
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An error occurred fetching your jobs."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data List */}
      {!isLoading && !isError && (
        <>
          <ResponsiveDataList
            items={items}
            keyExtractor={(item) => item.id}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Inbox}
                title={
                  activeTab === "pending"
                    ? "No Pending Assignments"
                    : activeTab === "history"
                      ? "No Completed History"
                      : "No Active Tasks Right Now"
                }
                description={
                  activeTab === "pending"
                    ? "You do not have any incoming work orders waiting for acceptance."
                    : activeTab === "history"
                      ? "Completed work orders and service reports will appear here."
                      : "You have no active visits currently scheduled. Check back once dispatched."
                }
              />
            }
            mobileCardRender={(item) => {
              const isPending = item.status === "ASSIGNED";
              const isHighPriority = item.request?.priority === "HIGH";

              return (
                <Card
                  className={`p-4 border shadow-2xs space-y-3 ${
                    isPending
                      ? "border-primary/40 bg-primary/[0.02]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-charcoal-100">
                          #{item.id.slice(0, 8)}
                        </span>
                        {isHighPriority && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0 text-[10px]"
                          >
                            <Star className="size-2.5 fill-amber-500 text-amber-500" />
                            HIGH
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                        {item.request?.title || "Service Work Order"}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/50 py-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Customer
                      </span>
                      <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                        {item.customer?.name || "Customer"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">
                        Scheduled Visit
                      </span>
                      <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                        {item.visitStart
                          ? formatSafeDate(item.visitStart)
                          : "Unscheduled"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Created {formatSafeDate(item.createdAt)}
                    </span>
                    <Link
                      href={`/technician/tasks/${item.id}`}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: isPending ? "default" : "outline",
                        }),
                        "text-xs h-8 gap-1.5",
                      )}
                    >
                      <span>{isPending ? "Accept / Review" : "Open Task"}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </Card>
              );
            }}
          />

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-2">
              <PaginationControls
                meta={pagination}
                onPageChange={(p) => updateFilters({ page: p })}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
