"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, History, Plus, RefreshCw, User } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { workOrdersService } from "@/services/work-orders.service";
import type {
  CustomerServiceHistoryItem,
  CustomerServiceHistoryQueryParams,
} from "@/types/api";

const STATUS_CHIPS = [
  { label: "All History", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Invoiced", value: "INVOICED" },
  { label: "Paid", value: "PAID" },
  { label: "Closed", value: "CLOSED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function CustomerHistoryClient() {
  const { filters, updateFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    order: "desc",
  });

  const queryParams = React.useMemo<CustomerServiceHistoryQueryParams>(() => {
    return {
      page: filters.page ? Number(filters.page) : 1,
      limit: filters.limit ? Number(filters.limit) : 10,
      status:
        filters.status && filters.status !== "ALL"
          ? (filters.status as CustomerServiceHistoryQueryParams["status"])
          : undefined,
      order: filters.order === "asc" ? "asc" : "desc",
    };
  }, [filters]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["customer-service-history", queryParams],
    queryFn: () => workOrdersService.fetchCustomerServiceHistory(queryParams),
    staleTime: 30_000,
  });

  const items = extractArray<CustomerServiceHistoryItem>(data);
  const pagination = data?.pagination;

  const currentStatus = (filters.status as string) || "ALL";

  const handleStatusSelect = (status: string) => {
    updateFilters({ status: status === "ALL" ? undefined : status });
  };

  const handleOrderToggle = () => {
    updateFilters({ order: filters.order === "asc" ? "desc" : "asc" });
  };

  const columns: ColumnDef<CustomerServiceHistoryItem>[] = [
    {
      id: "col-wo-number",
      header: "Job #",
      cell: (item) => (
        <span className="font-mono text-xs font-bold text-foreground">
          #{item.workOrderNumber || item.id.slice(0, 8)}
        </span>
      ),
      className: "w-32",
    },
    {
      id: "col-service",
      header: "Service",
      cell: (item) => (
        <div className="space-y-0.5 max-w-xs">
          <p className="font-semibold text-xs text-foreground truncate">
            {item.serviceRequest?.title ||
              item.category?.name ||
              "Field Service"}
          </p>
          {item.category?.name && item.serviceRequest?.title ? (
            <span className="text-[11px] text-muted-foreground block">
              {item.category.name}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "col-date",
      header: "Date Completed / Scheduled",
      cell: (item) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {item.completedAt
            ? safeFormatDate(item.completedAt)
            : item.visitStart || item.scheduledDate
              ? safeFormatDateTime(item.visitStart || item.scheduledDate)
              : safeFormatDate(item.createdAt)}
        </span>
      ),
      className: "w-44",
    },
    {
      id: "col-tech",
      header: "Technician",
      cell: (item) => {
        const name =
          item.technician?.name ||
          item.technician?.user?.name ||
          item.technicianName ||
          "-";
        return (
          <span className="text-xs font-medium text-foreground flex items-center gap-1.5 truncate">
            <User className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{name}</span>
          </span>
        );
      },
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
      cell: (item) => {
        const targetId =
          item.serviceRequestId || item.serviceRequest?.id || item.id;
        return (
          <Link
            href={`/customer/requests/${targetId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 text-xs gap-1 hover:border-brand-500 hover:text-brand-600",
            )}
          >
            <span>View</span>
            <ArrowRight className="size-3" />
          </Link>
        );
      },
      className: "w-24 text-right",
    },
  ];

  const renderMobileCard = (item: CustomerServiceHistoryItem) => {
    const targetId =
      item.serviceRequestId || item.serviceRequest?.id || item.id;
    const techName =
      item.technician?.name ||
      item.technician?.user?.name ||
      item.technicianName ||
      "Not assigned";

    return (
      <Card className="border border-border bg-card p-4 shadow-2xs space-y-3">
        <CardContent className="p-0 space-y-3 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-mono text-xs font-bold text-muted-foreground block">
                #{item.workOrderNumber || item.id.slice(0, 8)}
              </span>
              <h4 className="font-bold text-sm text-foreground line-clamp-1">
                {item.serviceRequest?.title ||
                  item.category?.name ||
                  "Service Job"}
              </h4>
              {item.category?.name && item.serviceRequest?.title && (
                <p className="text-[11px] text-muted-foreground">
                  {item.category.name}
                </p>
              )}
            </div>
            <StatusBadge status={item.status} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-muted-foreground">
            <div>
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                Date
              </span>
              <span className="font-medium text-foreground">
                {item.completedAt
                  ? safeFormatDate(item.completedAt)
                  : item.visitStart || item.scheduledDate
                    ? safeFormatDate(item.visitStart || item.scheduledDate)
                    : safeFormatDate(item.createdAt)}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                Technician
              </span>
              <span className="font-medium text-foreground truncate block">
                {techName}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Link
              href={`/customer/requests/${targetId}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 text-xs gap-1",
              )}
            >
              <span>View Job Details</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service History"
        description="Review completed field repairs, past maintenance visits, and cancelled appointments."
      />

      {/* Status Filter Chips and Controls */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_CHIPS.map((chip) => {
              const isSelected = currentStatus === chip.value;
              return (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleStatusSelect(chip.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Sort Order Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOrderToggle}
            className="h-8 text-xs gap-1.5"
          >
            <span>
              Sort: {filters.order === "asc" ? "Oldest First" : "Newest First"}
            </span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/10 p-6 text-center">
          <CardContent className="space-y-3 pt-3">
            <p className="text-sm font-semibold text-destructive">
              {(error as { message?: string })?.message ||
                "Failed to load service history. Please try again."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2 mx-auto"
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
              />
              <span>Retry</span>
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={History}
          title={
            currentStatus !== "ALL"
              ? "No matching service history"
              : "No service history yet"
          }
          description={
            currentStatus !== "ALL"
              ? "No past jobs match the selected status filter."
              : "You do not have any past service appointments. Book certified field technicians with live tracking."
          }
          action={
            currentStatus !== "ALL" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusSelect("ALL")}
              >
                Clear Status Filter
              </Button>
            ) : (
              <Link
                href="/customer/requests/new"
                className={cn(
                  buttonVariants({ variant: "cta", size: "default" }),
                  "gap-2 shadow-xs font-semibold",
                )}
              >
                <Plus className="size-4" />
                <span>Book Service</span>
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveDataList
            items={items}
            columns={columns}
            keyExtractor={(item) => item.id}
            mobileCardRender={renderMobileCard}
          />

          <PaginationControls
            meta={pagination}
            onPageChange={(p) => updateFilters({ page: p })}
          />
        </div>
      )}
    </div>
  );
}
