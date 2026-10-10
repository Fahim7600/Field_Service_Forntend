"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  FilterX,
  MessageSquare,
  RefreshCw,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminLogsService } from "@/services/admin-logs.service";
import { adminUsersService } from "@/services/admin-users.service";
import type { AdminUser, FeedbackItem, FeedbackParams } from "@/types/admin";

export function FeedbackClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
  });

  const ratingParam = (filters.rating as string) || "ALL";
  const technicianParam = (filters.technicianId as string) || "ALL";
  const page = filters.page || 1;

  const isFiltered = Boolean(
    ratingParam !== "ALL" || technicianParam !== "ALL",
  );

  // 1. Fetch Technicians for Filter Dropdown
  const {
    data: techniciansData,
    isLoading: isLoadingTechnicians,
    isError: isTechError,
  } = useQuery({
    queryKey: ["admin-technicians-list"],
    queryFn: () =>
      adminUsersService.fetchAdminUsers({
        role: "TECHNICIAN",
        limit: 100,
      }),
    staleTime: 60000,
  });

  const technicians = extractArray<AdminUser>(techniciansData);

  // 2. Fetch Feedback Reviews
  const queryParams: FeedbackParams = {
    page,
    limit: 10,
    rating:
      ratingParam !== "ALL" && !Number.isNaN(Number(ratingParam))
        ? Number(ratingParam)
        : undefined,
    technicianId: technicianParam !== "ALL" ? technicianParam : undefined,
  };

  const {
    data: feedbackData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin-feedback", queryParams],
    queryFn: () => adminLogsService.fetchFeedback(queryParams),
    staleTime: 10000,
  });

  const feedbackItems =
    feedbackData?.items ?? extractArray<FeedbackItem>(feedbackData);
  const pagination = feedbackData?.meta ?? feedbackData?.pagination;

  return (
    <div className="space-y-6">
      {/* Header Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Rating Filter */}
          <Select
            value={ratingParam}
            onValueChange={(val) =>
              updateFilters({
                rating: val === "ALL" ? undefined : val,
                page: 1,
              })
            }
          >
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Rating: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars (Excellent)</SelectItem>
              <SelectItem value="4">4 Stars (Very Good)</SelectItem>
              <SelectItem value="3">3 Stars (Good)</SelectItem>
              <SelectItem value="2">2 Stars (Fair)</SelectItem>
              <SelectItem value="1">1 Star (Poor)</SelectItem>
            </SelectContent>
          </Select>

          {/* Technician Filter */}
          {!isTechError ? (
            <Select
              value={technicianParam}
              disabled={isLoadingTechnicians}
              onValueChange={(val) =>
                updateFilters({
                  technicianId: val === "ALL" ? undefined : val,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="h-9 w-[180px] text-xs">
                <SelectValue
                  placeholder={
                    isLoadingTechnicians
                      ? "Loading technicians..."
                      : "Technician: All"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Technicians</SelectItem>
                {technicians.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span className="text-[11px] text-muted-foreground italic px-2">
              (Technician filter unavailable)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pagination && (
            <span className="text-xs text-muted-foreground font-medium hidden md:inline">
              {pagination.total} {pagination.total === 1 ? "review" : "reviews"}
            </span>
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5 mr-1" />
              Clear
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
            title="Refresh feedback"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh feedback</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load customer feedback
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while loading feedback records."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Feedback List */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {feedbackItems.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title={
                isFiltered ? "No matching feedback" : "No customer reviews yet"
              }
              description={
                isFiltered
                  ? "No customer reviews match your selected filter criteria."
                  : "Customer ratings and feedback submitted after paid work orders will appear here."
              }
              action={
                isFiltered ? (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {feedbackItems.map((item) => {
                const isLowRating = item.rating <= 2;
                const customerName = item.customer?.name || "Customer";
                const techName = item.technician?.name || "Unassigned";
                const workOrderId = item.workOrder?.id || item.workOrderId;
                const requestNumber = item.requestNumber;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "p-4 sm:p-5 border bg-card shadow-2xs space-y-3.5 transition-colors",
                      isLowRating
                        ? "border-l-4 border-l-rose-500 border-border"
                        : "border-border",
                    )}
                  >
                    {/* Header with Star Rating and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <StarRating
                          value={item.rating}
                          readOnly
                          size="sm"
                          showLabel
                        />
                        {isLowRating && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 gap-1 px-2 py-0.5"
                          >
                            <AlertTriangle className="size-3" />
                            <span>Low Rating</span>
                          </Badge>
                        )}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        Submitted {safeFormatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Feedback Comment */}
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-muted/20 p-3 rounded-lg border border-border/60">
                      {item.comment ? (
                        <p className="italic">"{item.comment}"</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No written comment provided.
                        </p>
                      )}
                    </div>

                    {/* Metadata Strip: Customer, Technician, Linked Work Order */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-muted-foreground border-t border-border/60">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <User className="size-3.5 text-muted-foreground" />
                          <span className="font-semibold text-foreground">
                            {customerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wrench className="size-3.5 text-muted-foreground" />
                          <span>{techName}</span>
                        </div>
                        {requestNumber && (
                          <div className="flex items-center gap-1">
                            <span>Request:</span>
                            <span className="font-mono font-medium text-foreground">
                              {requestNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      {workOrderId && (
                        <Link
                          href={`/admin/work-orders/${workOrderId}`}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <span>Work Order</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <PaginationControls
              meta={pagination}
              onPageChange={(p) => updateFilters({ page: p })}
            />
          )}
        </div>
      )}
    </div>
  );
}
