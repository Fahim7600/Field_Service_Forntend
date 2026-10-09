"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  ClipboardCheck,
  Filter,
  Inbox,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { DueBadge } from "@/components/shared/due-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { isPast, parseSafeDate, safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import type { DispatchQueueItem } from "@/types/api";

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "High / Premium", value: "HIGH" },
  { label: "Normal", value: "NORMAL" },
] as const;

type QueueType = "REQUEST_REVIEW" | "NEEDS_TECHNICIAN";

export function DispatchQueueClient() {
  const { filters, updateFilters } = useUrlFilters();

  const currentType: QueueType =
    (filters.type as string) === "NEEDS_TECHNICIAN"
      ? "NEEDS_TECHNICIAN"
      : "REQUEST_REVIEW";

  const priorityFilter = (filters.priority as string) || "";
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "dispatch-queue", { type: currentType, page, limit }],
    queryFn: () =>
      adminService.fetchDispatchQueue({
        type: currentType,
        page,
        limit,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const rawItems = extractArray<DispatchQueueItem>(data);
  const pagination = data?.pagination;

  // Filter in client if priority filter is selected
  const items = React.useMemo(() => {
    if (!priorityFilter) return rawItems;
    return rawItems.filter((item) => {
      const p = String(item.priority || "").toUpperCase();
      if (priorityFilter === "HIGH") {
        return p === "HIGH" || Boolean(item.isPremium);
      }
      if (priorityFilter === "NORMAL") {
        return p === "NORMAL" && !item.isPremium;
      }
      return true;
    });
  }, [rawItems, priorityFilter]);

  // Compute metrics
  const totalCount = pagination?.total ?? rawItems.length;
  const overdueCount = React.useMemo(() => {
    return rawItems.filter((i) => {
      if (i.isLate || i.isReviewOverdue) return true;
      if (!i.reviewDueAt) return false;
      const d = parseSafeDate(i.reviewDueAt);
      return d ? isPast(d) : false;
    }).length;
  }, [rawItems]);

  const handleTabChange = (newType: QueueType) => {
    if (newType === currentType) return;
    updateFilters({
      type: newType === "REQUEST_REVIEW" ? undefined : newType,
      page: 1,
    });
  };

  const columns: ColumnDef<DispatchQueueItem>[] = [
    {
      id: "requestNumber",
      header: currentType === "REQUEST_REVIEW" ? "Request #" : "Reference #",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono font-bold text-charcoal-900 dark:text-charcoal-100">
            {item.requestNumber || `#${item.id.slice(0, 8)}`}
          </span>
          {item.title && (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
              {item.title}
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
          {item.category?.name || "General Service"}
        </Badge>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (item) => <PriorityBadge priority={item.priority} />,
    },
    {
      id: "submitted",
      header: "Submitted",
      cell: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {safeFormatDate(item.createdAt)}
        </span>
      ),
    },
    {
      id: "due",
      header: currentType === "REQUEST_REVIEW" ? "Review Due" : "Due Date",
      cell: (item) => (
        <DueBadge
          reviewDueAt={item.reviewDueAt}
          status={currentType === "REQUEST_REVIEW" ? "SUBMITTED" : "APPROVED"}
        />
      ),
    },
    {
      id: "action",
      header: "Action",
      className: "text-right",
      cell: (item) => (
        <div className="flex justify-end">
          {currentType === "REQUEST_REVIEW" ? (
            <Link
              href={`/admin/dispatch/${item.id}`}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-8 px-3 font-semibold",
              )}
            >
              Review
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          ) : (
            <Link
              href={`/admin/dispatch/${item.id}?next=work-order`}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "h-8 px-3 font-semibold",
              )}
            >
              Open work order
              <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => handleTabChange("REQUEST_REVIEW")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
            currentType === "REQUEST_REVIEW"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
          )}
        >
          <ClipboardCheck className="size-4" />
          <span>Needs review</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("NEEDS_TECHNICIAN")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer",
            currentType === "NEEDS_TECHNICIAN"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
          )}
        >
          <UserCheck className="size-4" />
          <span>Needs technician</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel border border-border p-4 rounded-xl shadow-xs">
        {/* Count summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
              Queue Status:
            </span>
            <Badge
              variant="outline"
              className="font-semibold text-xs px-2.5 py-0.5"
            >
              {totalCount} waiting
            </Badge>
          </div>
          {overdueCount > 0 && (
            <Badge
              variant="outline"
              className="bg-destructive/15 text-destructive border-destructive/30 text-xs font-semibold px-2 py-0.5 inline-flex items-center gap-1"
            >
              <AlertCircle className="size-3" />
              <span>{overdueCount} overdue</span>
            </Badge>
          )}
        </div>

        {/* Priority Filter and Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) =>
                updateFilters({
                  priority: e.target.value || undefined,
                  page: 1,
                })
              }
              aria-label="Filter by priority"
              className="bg-transparent text-xs font-medium text-foreground focus:outline-hidden cursor-pointer"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
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
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-destructive">
                Failed to load dispatch queue
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
          icon={Inbox}
          title={
            currentType === "REQUEST_REVIEW"
              ? "Queue is clear"
              : "No work orders are waiting for a technician"
          }
          description={
            priorityFilter
              ? "No items match the selected priority filter."
              : currentType === "REQUEST_REVIEW"
                ? "There are no service requests currently waiting for review."
                : "All approved requests have been assigned to technicians."
          }
          action={
            priorityFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ priority: undefined, page: 1 })}
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
            mobileCardRender={(item) => (
              <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
                <CardContent className="p-0 space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm text-charcoal-900 dark:text-charcoal-100">
                      {item.requestNumber || `#${item.id.slice(0, 8)}`}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  {item.title && (
                    <p className="font-medium text-charcoal-800 dark:text-charcoal-200">
                      {item.title}
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
                        Category
                      </span>
                      <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                        {item.category?.name || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-charcoal-500">
                        {currentType === "REQUEST_REVIEW"
                          ? "Review Due"
                          : "Due Date"}
                      </span>
                      <DueBadge
                        reviewDueAt={item.reviewDueAt}
                        status={
                          currentType === "REQUEST_REVIEW"
                            ? "SUBMITTED"
                            : "APPROVED"
                        }
                      />
                    </div>
                    <Link
                      href={
                        currentType === "REQUEST_REVIEW"
                          ? `/admin/dispatch/${item.id}`
                          : `/admin/dispatch/${item.id}?next=work-order`
                      }
                      className={cn(
                        buttonVariants({ variant: "default", size: "sm" }),
                        "h-8 px-3 font-semibold",
                      )}
                    >
                      {currentType === "REQUEST_REVIEW"
                        ? "Review"
                        : "Open work order"}
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
