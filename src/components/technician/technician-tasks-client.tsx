"use client";

import { useQuery } from "@tanstack/react-query";
import { isToday as isTodayDateFns } from "date-fns";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpDown,
  Calendar,
  ClipboardList,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";

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
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { parseSafeDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getTechnicianActions } from "@/lib/work-order-rules";
import { technicianService } from "@/services/technician.service";
import type { TechnicianTask, WorkOrderStatus } from "@/types/work-order";

const STATUS_CHIPS: Array<{
  label: string;
  value: WorkOrderStatus | "";
}> = [
  { label: "All", value: "" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Arrived", value: "ARRIVED" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const VALID_STATUSES = new Set(
  STATUS_CHIPS.map((c) => c.value).filter(Boolean),
);

const SORT_OPTIONS: {
  label: string;
  sortBy: "createdAt" | "visitStart" | "status";
  order: "asc" | "desc";
}[] = [
  { label: "Newest first", sortBy: "createdAt", order: "desc" },
  { label: "Oldest first", sortBy: "createdAt", order: "asc" },
  { label: "Visit date (Soonest)", sortBy: "visitStart", order: "asc" },
  { label: "Visit date (Latest)", sortBy: "visitStart", order: "desc" },
];

export function TechnicianTasksClient() {
  const { filters, updateFilters } = useUrlFilters();

  const rawStatus = (filters.status as string) || "";
  const status: WorkOrderStatus | undefined = VALID_STATUSES.has(
    rawStatus as WorkOrderStatus,
  )
    ? (rawStatus as WorkOrderStatus)
    : undefined;

  const sortBy =
    (filters.sortBy as "createdAt" | "visitStart" | "status") || "createdAt";
  const order = (filters.order as "asc" | "desc") || "desc";
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["technician", "tasks", { page, limit, status, sortBy, order }],
    queryFn: () =>
      technicianService.fetchMyTasks({
        page,
        limit,
        status,
        sortBy,
        order,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const items = extractArray<TechnicianTask>(data);
  const pagination = data?.pagination;

  const currentSortValue = `${sortBy}-${order}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [selectedSortBy, selectedOrder] = e.target.value.split("-") as [
      "createdAt" | "visitStart" | "status",
      "asc" | "desc",
    ];
    updateFilters({
      sortBy:
        selectedSortBy === "createdAt" && selectedOrder === "desc"
          ? undefined
          : selectedSortBy,
      order:
        selectedSortBy === "createdAt" && selectedOrder === "desc"
          ? undefined
          : selectedOrder,
      page: 1,
    });
  };

  const isVisitToday = (dateValue?: string | null): boolean => {
    if (!dateValue) return false;
    const d = parseSafeDate(dateValue);
    return d ? isTodayDateFns(d) : false;
  };

  const columns: ColumnDef<TechnicianTask>[] = [
    {
      id: "job",
      header: "Job / Work Order #",
      cell: (item) => {
        const needsResponse = getTechnicianActions(item) === "RESPOND";
        const today = isVisitToday(item.visitStart);

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-bold text-charcoal-900 dark:text-charcoal-100">
                {item.workOrderNumber || `#${item.id.slice(0, 8)}`}
              </span>
              {needsResponse && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0 text-[10px]"
                >
                  <Sparkles className="size-2.5 text-amber-500" />
                  <span>Needs your response</span>
                </Badge>
              )}
              {today && (
                <Badge
                  variant="outline"
                  className="gap-1 border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0 text-[10px]"
                >
                  <Calendar className="size-2.5 text-blue-500" />
                  <span>Today</span>
                </Badge>
              )}
            </div>
            {item.request?.title && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {item.request.title}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "service",
      header: "Service",
      cell: (item) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {item.request?.category?.name || "General Service"}
        </Badge>
      ),
    },
    {
      id: "area",
      header: "Area",
      cell: (item) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground max-w-[180px]">
          <MapPin className="size-3 shrink-0 text-muted-foreground/70" />
          <span className="truncate">
            {item.request?.address || "Address not provided"}
          </span>
        </div>
      ),
    },
    {
      id: "visit",
      header: "Visit Window",
      cell: (item) => (
        <div className="text-xs">
          {item.visitStart ? (
            <span className="text-foreground whitespace-nowrap">
              {safeFormatDateTime(item.visitStart)}
            </span>
          ) : (
            <span className="text-muted-foreground italic">
              Not scheduled yet
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: "action",
      header: "Action",
      className: "text-right",
      cell: (item) => {
        const needsResponse = getTechnicianActions(item) === "RESPOND";
        return (
          <div className="flex justify-end">
            <Link
              href={`/technician/tasks/${item.id}`}
              className={cn(
                buttonVariants({
                  variant: needsResponse ? "default" : "outline",
                  size: "sm",
                }),
                "h-8 px-3 font-semibold text-xs gap-1.5",
              )}
            >
              <span>{needsResponse ? "Respond" : "View"}</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Status Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border">
        {STATUS_CHIPS.map((chip) => {
          const isSelected =
            chip.value === "" ? !status : status === chip.value;

          return (
            <button
              key={chip.label}
              type="button"
              onClick={() =>
                updateFilters({
                  status: chip.value || undefined,
                  page: 1,
                })
              }
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none",
                isSelected
                  ? "bg-charcoal-900 text-white dark:bg-charcoal-100 dark:text-charcoal-900 shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Count, Sort, Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel border border-border p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
            Assigned Tasks:
          </span>
          <Badge
            variant="outline"
            className="font-semibold text-xs px-2.5 py-0.5"
          >
            {pagination?.total ?? items.length}
          </Badge>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <select
              value={currentSortValue}
              onChange={handleSortChange}
              aria-label="Sort tasks"
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option
                  key={`${opt.sortBy}-${opt.order}`}
                  value={`${opt.sortBy}-${opt.order}`}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main List / Skeletons / Error / Empty View */}
      {isLoading ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
                  key={i}
                  className="h-14 w-full rounded-lg"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-destructive">
                Failed to load assigned tasks
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while communicating with the server."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={
            status
              ? `No ${status.toLowerCase()} tasks found`
              : "No jobs assigned to you yet"
          }
          description={
            status
              ? `You currently have no tasks matching the "${status}" status.`
              : "When the dispatch team assigns a new work order to you, it will appear here."
          }
          action={
            status ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ status: undefined, page: 1 })}
              >
                Clear Filter
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveDataList
            items={items}
            keyExtractor={(item) => item.id}
            columns={columns}
            mobileCardRender={(item) => {
              const needsResponse = getTechnicianActions(item) === "RESPOND";
              const today = isVisitToday(item.visitStart);

              return (
                <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
                  <CardContent className="p-0 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-charcoal-100">
                        {item.workOrderNumber || `#${item.id.slice(0, 8)}`}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {needsResponse && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0 text-[10px]"
                        >
                          <Sparkles className="size-2.5 text-amber-500" />
                          <span>Needs your response</span>
                        </Badge>
                      )}
                      {today && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0 text-[10px]"
                        >
                          <Calendar className="size-2.5 text-blue-500" />
                          <span>Today</span>
                        </Badge>
                      )}
                    </div>

                    {item.request?.title && (
                      <p className="font-medium text-charcoal-800 dark:text-charcoal-200">
                        {item.request.title}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-border/50">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-500">
                          Customer
                        </span>
                        <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                          {item.customer?.name || "Customer"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-500">
                          Service
                        </span>
                        <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                          {item.request?.category?.name || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-500">
                          Visit Window
                        </span>
                        <span className="text-xs text-foreground">
                          {item.visitStart
                            ? safeFormatDateTime(item.visitStart)
                            : "Not scheduled yet"}
                        </span>
                      </div>
                      <Link
                        href={`/technician/tasks/${item.id}`}
                        className={cn(
                          buttonVariants({
                            variant: needsResponse ? "default" : "outline",
                            size: "sm",
                          }),
                          "h-8 px-3 font-semibold",
                        )}
                      >
                        {needsResponse ? "Respond" : "View"}
                        <ArrowRight className="ml-1.5 size-3.5" />
                      </Link>
                    </div>
                  </CardContent>
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
        </div>
      )}
    </div>
  );
}
