"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  ClipboardList,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { requestsService } from "@/services/requests.service";
import type { ServiceRequestListItem } from "@/types/api";

const STATUS_FILTER_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
] as const;

const SKELETON_ROW_KEYS = [
  "sk-row-1",
  "sk-row-2",
  "sk-row-3",
  "sk-row-4",
  "sk-row-5",
];

export function CustomerRequestsClient() {
  const { filters, updateFilters } = useUrlFilters();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customer-service-requests", filters],
    queryFn: () => requestsService.fetchMyRequests(filters),
  });

  const items = extractArray<ServiceRequestListItem>(data);

  const columns: ColumnDef<ServiceRequestListItem>[] = [
    {
      id: "col-request-number",
      header: "Request #",
      cell: (item) => (
        <span className="font-mono font-semibold text-charcoal-900">
          #{item.requestNumber || item.id.substring(0, 8)}
        </span>
      ),
      className: "w-32",
    },
    {
      id: "col-title-category",
      header: "Service & Title",
      cell: (item) => (
        <div className="space-y-0.5 max-w-xs sm:max-w-md">
          <p className="font-semibold text-charcoal-900 truncate">
            {item.title}
          </p>
          {item.category?.name && (
            <span className="inline-block text-[11px] text-charcoal-500">
              {item.category.name}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "col-preferred-date",
      header: "Preferred Date",
      cell: (item) => (
        <span className="text-charcoal-700 whitespace-nowrap">
          {formatSafeDate(item.preferredDate || item.preferredAt)}
        </span>
      ),
      className: "w-36",
    },
    {
      id: "col-status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
      className: "w-32",
    },
    {
      id: "col-actions",
      header: "Action",
      cell: (item) => (
        <Link
          href={`/customer/requests/${item.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "xs" }),
            "gap-1 hover:border-brand-500 hover:text-brand-600",
          )}
        >
          View Details
          <ArrowRight className="size-3" />
        </Link>
      ),
      className: "w-28 text-right",
    },
  ];

  const renderMobileCard = (item: ServiceRequestListItem) => (
    <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
      <CardContent className="p-0 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-mono text-xs font-bold text-charcoal-600 block">
              #{item.requestNumber || item.id.substring(0, 8)}
            </span>
            <h4 className="font-bold text-sm text-charcoal-900 line-clamp-1">
              {item.title}
            </h4>
            {item.category?.name && (
              <p className="text-xs text-charcoal-500">{item.category.name}</p>
            )}
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-charcoal-600">
          <span>
            Preferred:{" "}
            <strong className="text-charcoal-800">
              {formatSafeDate(item.preferredDate || item.preferredAt)}
            </strong>
          </span>
          <Link
            href={`/customer/requests/${item.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "xs" }),
              "gap-1",
            )}
          >
            Details
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-2xs">
        {/* Left Filter: Status */}
        <div className="flex items-center gap-2.5">
          <Filter className="size-4 text-charcoal-500 shrink-0" />
          <select
            id="status-filter"
            value={filters.status || ""}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 outline-none transition-colors"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {isFetching && (
            <RefreshCw className="size-3.5 text-brand-600 animate-spin ml-1" />
          )}
        </div>

        {/* Right Action: Book Service */}
        <Link
          href="/customer/requests/new"
          className={cn(buttonVariants({ variant: "cta", size: "sm" }))}
        >
          <Plus className="size-4 mr-1.5" />
          Book New Request
        </Link>
      </div>

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div className="space-y-3">
          {SKELETON_ROW_KEYS.map((key) => (
            <Card key={key} className="border border-border p-4 bg-card">
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
        /* Error State */
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/10 text-center space-y-3">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-destructive">
              Failed to load service requests
            </h3>
            <p className="text-xs text-charcoal-600">
              {error instanceof Error
                ? error.message
                : "An error occurred while fetching requests."}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <EmptyState
          icon={ClipboardList}
          title="No service requests found"
          description={
            filters.status
              ? `No service requests matched the "${filters.status}" filter.`
              : "You haven't submitted any service requests yet. Book your first appointment today."
          }
          action={
            <Link
              href="/customer/requests/new"
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              <Plus className="size-4 mr-1.5" />
              Book a Service
            </Link>
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
