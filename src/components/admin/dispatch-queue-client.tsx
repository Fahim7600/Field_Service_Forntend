"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Inbox,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

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
import { formatSafeDate, formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import type { DispatchQueueItem } from "@/types/api";

export function DispatchQueueClient() {
  const { filters, updateFilters } = useUrlFilters();

  const typeFilter =
    (filters.type as "REQUEST_REVIEW" | "NEEDS_TECHNICIAN") || undefined;
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "dispatch-queue", { page, limit, type: typeFilter }],
    queryFn: () =>
      adminService.fetchDispatchQueue({ page, limit, type: typeFilter }),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const items = extractArray<DispatchQueueItem>(data);
  const pagination = data?.pagination;

  const columns: ColumnDef<DispatchQueueItem>[] = [
    {
      id: "requestNumber",
      header: "Request #",
      cell: (item) => {
        const isHighPriority = item.priority === "HIGH";
        const isPremium = Boolean(item.isPremium);
        const isOverdue = Boolean(item.isLate);

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono font-semibold text-charcoal-900 dark:text-charcoal-100">
                {item.requestNumber || item.id.slice(0, 8)}
              </span>
              {isHighPriority && (
                <Badge
                  variant="outline"
                  className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold px-1.5 py-0 text-[10px]"
                >
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  HIGH
                </Badge>
              )}
              {isPremium && (
                <Badge
                  variant="outline"
                  className="gap-1 border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold px-1.5 py-0 text-[10px]"
                >
                  <Sparkles className="size-3 text-purple-500" />
                  PREMIUM
                </Badge>
              )}
            </div>
            {isOverdue && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                <span>Review Overdue</span>
              </div>
            )}
            {item.title && (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {item.title}
              </span>
            )}
          </div>
        );
      },
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
      id: "type",
      header: "Queue Stage",
      cell: (item) => {
        const isNeedsTech = item.type === "NEEDS_TECHNICIAN";
        return (
          <StatusBadge
            status={isNeedsTech ? "APPROVED" : "SUBMITTED"}
            label={isNeedsTech ? "Needs Tech" : "Awaiting Review"}
          />
        );
      },
    },
    {
      id: "date",
      header: "Submitted At",
      cell: (item) => (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>{formatSafeDate(item.createdAt)}</span>
          <span className="text-[11px] opacity-80">
            {formatSafeDateTime(item.createdAt, "h:mm a")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (item) => {
        const targetId = item.requestId || item.id;
        const isNeedsTech = item.type === "NEEDS_TECHNICIAN";

        return (
          <Link
            href={`/admin/dispatch/${targetId}`}
            className={cn(
              buttonVariants({
                size: "sm",
                variant: item.priority === "HIGH" ? "default" : "outline",
              }),
              "text-xs h-8 gap-1.5 shadow-2xs",
            )}
          >
            <span>{isNeedsTech ? "Assign" : "Review"}</span>
            <ExternalLink className="size-3.5" />
          </Link>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border">
          <Button
            size="sm"
            variant={typeFilter === undefined ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ type: undefined, page: 1 })}
          >
            All Items
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "REQUEST_REVIEW" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ type: "REQUEST_REVIEW", page: 1 })}
          >
            Awaiting Review
          </Button>
          <Button
            size="sm"
            variant={typeFilter === "NEEDS_TECHNICIAN" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ type: "NEEDS_TECHNICIAN", page: 1 })}
          >
            Needs Technician
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground" />
          <span>High-priority requests sorted to top</span>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && !data && (
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
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
                Failed to load dispatch queue
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An error occurred while fetching requests."}
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

      {/* Data Table */}
      {!isLoading && !isError && (
        <>
          <ResponsiveDataList
            items={items}
            keyExtractor={(item) => item.id}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Inbox}
                title="Dispatch Queue is Empty"
                description={
                  typeFilter
                    ? "No pending items found for the selected filter stage."
                    : "All customer service requests have been reviewed and assigned."
                }
              />
            }
            mobileCardRender={(item) => {
              const targetId = item.requestId || item.id;
              const isHighPriority = item.priority === "HIGH";
              const isPremium = Boolean(item.isPremium);
              const isNeedsTech = item.type === "NEEDS_TECHNICIAN";

              return (
                <Card
                  className={`p-4 border transition-colors shadow-2xs space-y-3 ${
                    isHighPriority
                      ? "border-amber-500/40 bg-amber-500/[0.02]"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-charcoal-100">
                          {item.requestNumber || item.id.slice(0, 8)}
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
                        {isPremium && (
                          <Badge
                            variant="outline"
                            className="gap-1 border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold px-1.5 py-0 text-[10px]"
                          >
                            <Sparkles className="size-2.5 text-purple-500" />
                            PREMIUM
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-200">
                        {item.title || "Service Request"}
                      </p>
                    </div>

                    <StatusBadge
                      status={isNeedsTech ? "APPROVED" : "SUBMITTED"}
                      label={isNeedsTech ? "Needs Tech" : "Pending"}
                    />
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
                        Category
                      </span>
                      <span className="font-medium text-charcoal-900 dark:text-charcoal-100">
                        {item.category?.name || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {formatSafeDate(item.createdAt)}
                    </span>
                    <Link
                      href={`/admin/dispatch/${targetId}`}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: isHighPriority ? "default" : "outline",
                        }),
                        "text-xs h-8 gap-1.5",
                      )}
                    >
                      <span>
                        {isNeedsTech ? "Assign Technician" : "Review Request"}
                      </span>
                      <ExternalLink className="size-3.5" />
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
