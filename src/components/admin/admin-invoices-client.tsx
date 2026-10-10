"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Eye, Plus, Receipt, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { CreateInvoiceDialog } from "@/components/admin/create-invoice-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { QueryError } from "@/components/shared/query-error";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { formatMoney, safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { InvoiceListItem, InvoiceStatus } from "@/types/api";

const STATUS_CHIPS: Array<{ label: string; value: InvoiceStatus | "ALL" }> = [
  { label: "All Invoices", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Issued", value: "ISSUED" },
  { label: "Paid", value: "PAID" },
  { label: "Void", value: "VOID" },
];

export function AdminInvoicesClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const rawStatus = filters.status ? String(filters.status).toUpperCase() : "";
  const statusFilter =
    rawStatus && rawStatus !== "ALL" ? (rawStatus as InvoiceStatus) : undefined;
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const sortBy = filters.sortBy || "createdAt";
  const order = filters.order || "desc";

  const sortValue =
    sortBy === "totalCents" && order === "desc"
      ? "highest_total"
      : sortBy === "createdAt" && order === "asc"
        ? "oldest"
        : "newest";

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [
      "invoices",
      { status: statusFilter, page, limit, sortBy, order },
    ],
    queryFn: () =>
      financeService.fetchInvoices({
        status: statusFilter,
        page,
        limit,
        sortBy,
        order,
      }),
    staleTime: 15000,
  });

  const items = extractArray<InvoiceListItem>(data);
  const pagination = data?.pagination;

  const handleSortChange = (value: string) => {
    if (value === "highest_total") {
      updateFilters({ sortBy: "totalCents", order: "desc", page: 1 });
    } else if (value === "oldest") {
      updateFilters({ sortBy: "createdAt", order: "asc", page: 1 });
    } else {
      updateFilters({ sortBy: "createdAt", order: "desc", page: 1 });
    }
  };

  const handleStatusChange = (statusVal: InvoiceStatus | "ALL") => {
    updateFilters({
      status: statusVal === "ALL" ? undefined : statusVal,
      page: 1,
    });
  };

  const isFiltered = Boolean(statusFilter);

  const columns: ColumnDef<InvoiceListItem>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      cell: (item) => (
        <div className="flex flex-col">
          <Link
            href={`/admin/invoices/${item.id}`}
            className="font-mono font-bold text-foreground hover:underline inline-flex items-center gap-1"
          >
            <span>{item.invoiceNumber || item.id.slice(0, 8)}</span>
          </Link>
          {item.workOrder?.id && (
            <Link
              href={`/admin/work-orders/${item.workOrder.id}`}
              className="text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors"
            >
              WO #
              {item.workOrder.workOrderNumber || item.workOrder.id.slice(0, 8)}
            </Link>
          )}
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {item.customer?.name || "Customer"}
          </span>
          {item.customer?.email && (
            <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">
              {item.customer.email}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (item) => (
        <span className="font-semibold text-foreground">
          {formatMoney(item.totalCents)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      id: "date",
      header: "Created",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {safeFormatDate(item.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (item) => (
        <Link
          href={`/admin/invoices/${item.id}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 px-2.5 text-xs gap-1.5 font-medium",
          )}
        >
          <Eye className="size-3.5" />
          <span>View</span>
        </Link>
      ),
    },
  ];

  const renderMobileCard = (item: InvoiceListItem) => (
    <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <Link
              href={`/admin/invoices/${item.id}`}
              className="font-mono font-bold text-sm text-foreground hover:underline"
            >
              {item.invoiceNumber || item.id.slice(0, 8)}
            </Link>
            {item.workOrder?.id && (
              <p className="text-[11px] text-muted-foreground font-mono">
                WO #
                {item.workOrder.workOrderNumber ||
                  item.workOrder.id.slice(0, 8)}
              </p>
            )}
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-border/50">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Customer
            </span>
            <span className="font-medium text-foreground truncate block">
              {item.customer?.name || "Customer"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Total Amount
            </span>
            <span className="font-bold text-foreground">
              {formatMoney(item.totalCents)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-muted-foreground text-[11px]">
            Created {safeFormatDate(item.createdAt)}
          </span>
          <Link
            href={`/admin/invoices/${item.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 text-xs gap-1.5",
            )}
          >
            <Eye className="size-3.5" />
            <span>View</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {STATUS_CHIPS.map((chip) => {
            const isSelected =
              chip.value === "ALL"
                ? !statusFilter
                : statusFilter === chip.value;
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleStatusChange(chip.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Action Buttons & Sort */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <Select
              value={sortValue}
              onValueChange={(val) => {
                if (val) handleSortChange(val);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] text-xs gap-1.5">
                <ArrowUpDown className="size-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-xs">
                  Newest First
                </SelectItem>
                <SelectItem value="oldest" className="text-xs">
                  Oldest First
                </SelectItem>
                <SelectItem value="highest_total" className="text-xs">
                  Highest Total
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              aria-label="Refresh invoices"
            >
              <RefreshCw
                className={cn("size-3.5", isFetching && "animate-spin")}
              />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Plus className="size-4" />
            <span>Create Invoice</span>
          </Button>
        </div>
      </div>

      {/* Main Data Content */}
      {isLoading ? (
        <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load invoices"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={
            isFiltered ? "No matching invoices" : "No invoices created yet"
          }
          description={
            isFiltered
              ? "No invoices match the selected status filter. Try selecting another status or clearing filters."
              : "Draft invoices are generated automatically when technicians submit service reports, or you can create one manually."
          }
          action={
            isFiltered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetFilters()}
                className="gap-1.5 text-xs font-semibold"
              >
                <span>Clear Filters</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="size-4" />
                <span>Create Invoice</span>
              </Button>
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

      {/* Fallback Manual Create Invoice Modal */}
      <CreateInvoiceDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
