"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { QueryError } from "@/components/shared/query-error";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getDisplayStatus } from "@/lib/work-order-rules";
import { requestsService } from "@/services/requests.service";
import type {
  CustomerRequestListItem,
  ServiceRequestQueryParams,
} from "@/types/api";

const STATUS_CHIPS = [
  { label: "All Requests", value: "" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

const SORT_OPTIONS = [
  { label: "Newest first", sortBy: "createdAt", order: "desc" },
  { label: "Oldest first", sortBy: "createdAt", order: "asc" },
  { label: "Preferred date", sortBy: "preferredAt", order: "asc" },
  { label: "High priority", sortBy: "priority", order: "desc" },
] as const;

export function CustomerRequestsClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });

  const rawQ = typeof filters.q === "string" ? filters.q : "";
  const [searchInput, setSearchInput] = React.useState(rawQ);

  // Sync search input when URL changes externally
  React.useEffect(() => {
    setSearchInput(rawQ);
  }, [rawQ]);

  // Debounce search update to URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed !== rawQ) {
        updateFilters({ q: trimmed || undefined });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, rawQ, updateFilters]);

  const isSearchActive = Boolean(rawQ && rawQ.trim().length >= 2);

  // Fetch data: use searchMyRequests if search query is active, otherwise fetchMyRequests
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customer", "requests", filters],
    queryFn: () => {
      if (isSearchActive) {
        return requestsService.searchMyRequests(rawQ, {
          page: filters.page ? Number(filters.page) : 1,
          limit: filters.limit ? Number(filters.limit) : 10,
        });
      }
      return requestsService.fetchMyRequests(
        filters as ServiceRequestQueryParams,
      );
    },
  });

  const items = extractArray<CustomerRequestListItem>(data);

  const handleClearSearch = () => {
    setSearchInput("");
    updateFilters({ q: undefined });
  };

  const handleStatusChange = (status: string) => {
    updateFilters({ status: status || undefined });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ priority: e.target.value || undefined });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SORT_OPTIONS.find(
      (s) => `${s.sortBy}:${s.order}` === e.target.value,
    );
    if (selected) {
      updateFilters({ sortBy: selected.sortBy, order: selected.order });
    }
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFilters({ dateFrom: val ? `${val}T00:00:00.000Z` : undefined });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateFilters({ dateTo: val ? `${val}T23:59:59.999Z` : undefined });
  };

  const currentSortKey = `${filters.sortBy || "createdAt"}:${filters.order || "desc"}`;
  const rawDateFrom =
    typeof filters.dateFrom === "string"
      ? safeFormatDate(filters.dateFrom, "yyyy-MM-dd", "")
      : "";
  const rawDateTo =
    typeof filters.dateTo === "string"
      ? safeFormatDate(filters.dateTo, "yyyy-MM-dd", "")
      : "";

  const hasNonDefaultFilters = Boolean(
    rawQ ||
      filters.status ||
      filters.priority ||
      filters.dateFrom ||
      filters.dateTo,
  );

  const columns: ColumnDef<CustomerRequestListItem>[] = [
    {
      id: "col-request-number",
      header: "Request #",
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-foreground">
          #{item.requestNumber || item.id.substring(0, 8)}
        </span>
      ),
      className: "w-28",
    },
    {
      id: "col-title-category",
      header: "Service & Title",
      cell: (item) => (
        <div className="space-y-0.5 max-w-xs sm:max-w-md">
          <p className="font-semibold text-xs text-foreground truncate">
            {item.title}
          </p>
          {item.category?.name ? (
            <span className="inline-block text-[11px] text-muted-foreground">
              {item.category.name}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "col-preferred-date",
      header: "Preferred Time",
      cell: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {safeFormatDateTime(item.preferredDate || item.preferredAt)}
        </span>
      ),
      className: "w-40",
    },
    {
      id: "col-priority",
      header: "Priority",
      cell: (item) => <PriorityBadge priority={item.priority || "NORMAL"} />,
      className: "w-24",
    },
    {
      id: "col-status",
      header: "Status",
      cell: (item) => <StatusBadge status={getDisplayStatus(item)} />,
      className: "w-32",
    },
    {
      id: "col-actions",
      header: "Action",
      cell: (item) => (
        <Link
          href={`/customer/requests/${item.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-7 text-xs gap-1 hover:border-brand-500 hover:text-brand-600",
          )}
        >
          <span>View</span>
          <ArrowRight className="size-3" />
        </Link>
      ),
      className: "w-24 text-right",
    },
  ];

  const renderMobileCard = (item: CustomerRequestListItem) => (
    <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-bold text-muted-foreground block">
              #{item.requestNumber || item.id.substring(0, 8)}
            </span>
            <h4 className="font-bold text-sm text-foreground line-clamp-1">
              {item.title}
            </h4>
            {item.category?.name && (
              <p className="text-xs text-muted-foreground">
                {item.category.name}
              </p>
            )}
          </div>
          <StatusBadge status={getDisplayStatus(item)} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
          <div className="space-y-0.5">
            <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Preferred Appointment
            </span>
            <span className="font-medium text-foreground">
              {safeFormatDateTime(item.preferredDate || item.preferredAt)}
            </span>
          </div>

          <Link
            href={`/customer/requests/${item.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 text-xs gap-1",
            )}
          >
            <span>Details</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Top Controls Toolbar */}
      <div className="space-y-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="search"
              placeholder="Search requests by title or number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Book Service Action (CTA Orange Variant Allowed Here) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {isFetching && (
              <RefreshCw className="size-3.5 text-brand-600 animate-spin mr-1" />
            )}
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "sm" }),
                "gap-1.5 font-semibold text-xs shadow-xs",
              )}
            >
              <Plus className="size-4" />
              <span>Book Service</span>
            </Link>
          </div>
        </div>

        {/* Search Mode Notice vs Filter Controls */}
        {isSearchActive ? (
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Filters are disabled while searching. Clear search to restore
                filters.
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClearSearch}
              className="text-xs font-semibold hover:bg-amber-500/20"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-border/60">
            {/* Status Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUS_CHIPS.map((chip) => {
                const isActive = (filters.status || "") === chip.value;
                return (
                  <button
                    type="button"
                    key={chip.value || "all"}
                    onClick={() => handleStatusChange(chip.value)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      isActive
                        ? "bg-charcoal-900 text-white dark:bg-charcoal-100 dark:text-charcoal-900 font-semibold shadow-2xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Secondary Filter Row: Priority, Date Range & Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
              {/* Priority Filter */}
              <div>
                <select
                  value={filters.priority || ""}
                  onChange={handlePriorityChange}
                  aria-label="Filter by priority"
                  className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
                >
                  <option value="">All Priorities</option>
                  <option value="HIGH">High Priority Only</option>
                  <option value="NORMAL">Normal Priority</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <Input
                  type="date"
                  value={rawDateFrom}
                  onChange={handleDateFromChange}
                  aria-label="Filter from date"
                  placeholder="From date"
                  className="h-8 text-xs"
                />
              </div>

              {/* Date To */}
              <div>
                <Input
                  type="date"
                  min={rawDateFrom || undefined}
                  value={rawDateTo}
                  onChange={handleDateToChange}
                  aria-label="Filter to date"
                  placeholder="To date"
                  className="h-8 text-xs"
                />
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={currentSortKey}
                  onChange={handleSortChange}
                  aria-label="Sort requests"
                  className="w-full h-8 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option
                      key={`${opt.sortBy}:${opt.order}`}
                      value={`${opt.sortBy}:${opt.order}`}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border border-border p-4 bg-card">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-28 hidden sm:block" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-7 w-24 hidden md:block" />
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load service requests"
        />
      ) : items.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={ClipboardList}
          title={
            hasNonDefaultFilters
              ? "No matching requests found"
              : "You have not booked any service yet"
          }
          description={
            hasNonDefaultFilters
              ? "Try adjusting or clearing your search filters to find what you're looking for."
              : "Submit your first service appointment request to get scheduled with a certified technician."
          }
          action={
            hasNonDefaultFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
              >
                Clear all filters
              </Button>
            ) : (
              <Link
                href="/customer/requests/new"
                className={cn(buttonVariants({ variant: "cta", size: "sm" }))}
              >
                <Plus className="size-4 mr-1.5" />
                Book Service
              </Link>
            )
          }
        />
      ) : (
        /* Data List View */
        <div className="space-y-4">
          <ResponsiveDataList
            items={items}
            keyExtractor={(item) => item.id}
            columns={columns}
            mobileCardRender={renderMobileCard}
          />

          {/* Pagination Controls */}
          <PaginationControls
            meta={data?.pagination}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </div>
      )}
    </div>
  );
}
