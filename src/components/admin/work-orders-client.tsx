"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpDown,
  ClipboardList,
  Filter,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { QueryError } from "@/components/shared/query-error";
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
import { safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workOrdersService } from "@/services/work-orders.service";
import type { WorkOrder, WorkOrderStatus } from "@/types/work-order";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "" },
  { label: "Approved", value: "APPROVED" },
  { label: "Assigned", value: "ASSIGNED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Arrived", value: "ARRIVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Invoiced", value: "INVOICED" },
  { label: "Paid", value: "PAID" },
  { label: "Closed", value: "CLOSED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const SORT_OPTIONS: {
  label: string;
  sortBy: "createdAt" | "visitStart" | "status";
  order: "asc" | "desc";
}[] = [
  { label: "Created (Newest)", sortBy: "createdAt", order: "desc" },
  { label: "Created (Oldest)", sortBy: "createdAt", order: "asc" },
  { label: "Visit Start (Soonest)", sortBy: "visitStart", order: "asc" },
  { label: "Visit Start (Latest)", sortBy: "visitStart", order: "desc" },
  { label: "Status (A-Z)", sortBy: "status", order: "asc" },
];

export function WorkOrdersClient() {
  const { filters, updateFilters } = useUrlFilters();

  const status = (filters.status as WorkOrderStatus) || undefined;
  const sortBy =
    (filters.sortBy as "createdAt" | "visitStart" | "status") || "createdAt";
  const order = (filters.order as "asc" | "desc") || "desc";
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "work-orders", { page, limit, status, sortBy, order }],
    queryFn: () =>
      workOrdersService.fetchWorkOrders({
        page,
        limit,
        status,
        sortBy,
        order,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const items = extractArray<WorkOrder>(data);
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

  const columns: ColumnDef<WorkOrder>[] = [
    {
      id: "workOrderNumber",
      header: "Work Order #",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono font-bold text-charcoal-900 dark:text-charcoal-100">
            {item.workOrderNumber || `#${item.id.slice(0, 8)}`}
          </span>
          {item.request?.title && (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[180px]">
              {item.request.title}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
            {item.customer?.name || "Customer"}
          </span>
          {item.customer?.email && (
            <span className="text-[11px] text-muted-foreground">
              {item.customer.email}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (item) => (
        <Badge variant="secondary" className="font-medium text-xs">
          {item.request?.category?.name || "General Service"}
        </Badge>
      ),
    },
    {
      id: "technician",
      header: "Technician",
      cell: (item) => (
        <div>
          {item.technician ? (
            <span className="font-medium text-xs text-foreground">
              {item.technician.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">
              Unassigned
            </span>
          )}
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
            <span className="text-muted-foreground italic">Not scheduled</span>
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
      cell: (item) => (
        <div className="flex justify-end">
          <Link
            href={`/admin/work-orders/${item.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 px-3 font-semibold",
            )}
          >
            <span>View</span>
            <ArrowRight className="ml-1.5 size-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  const hasActiveFilters = Boolean(status || filters.sortBy || filters.order);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel border border-border p-4 rounded-xl shadow-xs">
        {/* Count summary */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
            Total Work Orders:
          </span>
          <Badge
            variant="outline"
            className="font-semibold text-xs px-2.5 py-0.5"
          >
            {pagination?.total ?? items.length}
          </Badge>
        </div>

        {/* Filters and Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={status || ""}
              onChange={(e) =>
                updateFilters({
                  status: (e.target.value as WorkOrderStatus) || undefined,
                  page: 1,
                })
              }
              aria-label="Filter by status"
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <select
              value={currentSortValue}
              onChange={handleSortChange}
              aria-label="Sort work orders"
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

      {/* Main Table / Skeletons / Error / Empty View */}
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
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load work orders"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No work orders found"
          description={
            hasActiveFilters
              ? "No work orders match the selected filters."
              : "There are currently no active work orders in the system."
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  updateFilters({
                    status: undefined,
                    sortBy: undefined,
                    order: undefined,
                    page: 1,
                  })
                }
              >
                Clear Filters
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
            mobileCardRender={(item) => (
              <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
                <CardContent className="p-0 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-charcoal-100">
                      {item.workOrderNumber || `#${item.id.slice(0, 8)}`}
                    </span>
                    <StatusBadge status={item.status} />
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
                        Technician
                      </span>
                      <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                        {item.technician?.name || (
                          <span className="text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
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
                          : "Not scheduled"}
                      </span>
                    </div>
                    <Link
                      href={`/admin/work-orders/${item.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "h-8 px-3 font-semibold",
                      )}
                    >
                      View
                      <ArrowRight className="ml-1.5 size-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
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
