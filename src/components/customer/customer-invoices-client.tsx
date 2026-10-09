"use client";

import { useQuery } from "@tanstack/react-query";
import { isPast, parseISO } from "date-fns";
import {
  AlertCircle,
  ArrowUpDown,
  CreditCard,
  Eye,
  FileText,
  Receipt,
  RefreshCw,
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
import type { CustomerInvoiceStatus, InvoiceListItem } from "@/types/api";

const CUSTOMER_STATUS_CHIPS: Array<{
  label: string;
  value: CustomerInvoiceStatus | "ALL";
}> = [
  { label: "All Invoices", value: "ALL" },
  { label: "Unpaid", value: "ISSUED" },
  { label: "Paid", value: "PAID" },
  { label: "Void", value: "VOID" },
];

export function CustomerInvoicesClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });

  const rawStatus = filters.status ? String(filters.status).toUpperCase() : "";
  const statusFilter =
    rawStatus && rawStatus !== "ALL"
      ? (rawStatus as CustomerInvoiceStatus)
      : undefined;
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
      "customer",
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

  const handleStatusChange = (statusVal: CustomerInvoiceStatus | "ALL") => {
    updateFilters({
      status: statusVal === "ALL" ? undefined : statusVal,
      page: 1,
    });
  };

  const isFiltered = Boolean(statusFilter);

  const checkIsOverdue = (dueDateStr?: string | null, status?: string) => {
    if (!dueDateStr || status !== "ISSUED") return false;
    try {
      const parsed = parseISO(dueDateStr);
      return !Number.isNaN(parsed.getTime()) && isPast(parsed);
    } catch {
      return false;
    }
  };

  const columns: ColumnDef<InvoiceListItem>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      cell: (item) => (
        <div className="flex flex-col">
          <Link
            href={`/customer/invoices/${item.id}`}
            className="font-mono font-bold text-foreground hover:underline"
          >
            {item.invoiceNumber || item.id.slice(0, 8)}
          </Link>
          <span className="text-[11px] text-muted-foreground">
            Issued {safeFormatDate(item.issuedAt || item.createdAt)}
          </span>
        </div>
      ),
    },
    {
      id: "service",
      header: "Service",
      cell: (item) => {
        const woRef = item.workOrder;
        const woNumber =
          woRef?.workOrderNumber || item.workOrderId?.slice(0, 8);
        return (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {woNumber ? `Work Order #${woNumber}` : "Service Visit"}
            </span>
          </div>
        );
      },
    },
    {
      id: "total",
      header: "Total",
      cell: (item) => (
        <span className="font-semibold text-foreground font-mono">
          {formatMoney(item.totalCents)}
        </span>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      cell: (item) => {
        const isOverdue = checkIsOverdue(item.dueDate, item.status);
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs",
                isOverdue
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {safeFormatDate(item.dueDate)}
            </span>
            {isOverdue && (
              <Badge
                variant="destructive"
                className="text-[9px] uppercase px-1.5 py-0 font-bold tracking-wider"
              >
                Overdue
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <StatusBadge
          status={item.status}
          label={item.status === "ISSUED" ? "Unpaid" : undefined}
        />
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (item) => {
        const isUnpaid = item.status === "ISSUED";
        return (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/customer/invoices/${item.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-2.5 text-xs gap-1.5 font-medium",
              )}
            >
              <Eye className="size-3.5" />
              <span>View</span>
            </Link>
            {isUnpaid && (
              <Link
                href={`/customer/invoices/${item.id}`}
                className={cn(
                  buttonVariants({ variant: "cta", size: "sm" }),
                  "h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs",
                )}
              >
                <CreditCard className="size-3.5" />
                <span>Pay</span>
              </Link>
            )}
          </div>
        );
      },
    },
  ];

  const renderMobileCard = (item: InvoiceListItem) => {
    const isUnpaid = item.status === "ISSUED";
    const isOverdue = checkIsOverdue(item.dueDate, item.status);
    const woRef = item.workOrder;
    const woNumber = woRef?.workOrderNumber || item.workOrderId?.slice(0, 8);

    return (
      <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <Link
                href={`/customer/invoices/${item.id}`}
                className="font-mono font-bold text-sm text-foreground hover:underline"
              >
                {item.invoiceNumber || item.id.slice(0, 8)}
              </Link>
              <p className="text-[11px] text-muted-foreground">
                {woNumber ? `Work Order #${woNumber}` : "Service Visit"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {isOverdue && (
                <Badge
                  variant="destructive"
                  className="text-[9px] uppercase px-1.5 py-0 font-bold tracking-wider"
                >
                  Overdue
                </Badge>
              )}
              <StatusBadge
                status={item.status}
                label={item.status === "ISSUED" ? "Unpaid" : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-1 border-y border-border/50">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Due Date
              </span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue
                    ? "text-destructive font-semibold"
                    : "text-foreground",
                )}
              >
                {safeFormatDate(item.dueDate)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Total Amount
              </span>
              <span className="font-bold text-foreground font-mono">
                {formatMoney(item.totalCents)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Link
              href={`/customer/invoices/${item.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-3 text-xs gap-1.5 font-medium flex-1 sm:flex-initial justify-center",
              )}
            >
              <Eye className="size-3.5" />
              <span>View Invoice</span>
            </Link>
            {isUnpaid && (
              <Link
                href={`/customer/invoices/${item.id}`}
                className={cn(
                  buttonVariants({ variant: "cta", size: "sm" }),
                  "h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs flex-1 sm:flex-initial justify-center",
                )}
              >
                <CreditCard className="size-3.5" />
                <span>Pay Now</span>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation Header (Invoices / Future Payments) */}
      <div className="flex items-center border-b border-border">
        <button
          type="button"
          className="pb-2.5 px-4 text-sm font-bold text-primary border-b-2 border-primary -mb-px flex items-center gap-2"
        >
          <Receipt className="size-4" />
          <span>Invoices</span>
        </button>
      </div>

      {/* Filter Chips & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CUSTOMER_STATUS_CHIPS.map((chip) => {
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

        {/* Sort & Refresh */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
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
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/30 bg-destructive/5 text-center p-6 space-y-3">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load invoices
              </h3>
              <p className="text-xs text-muted-foreground">
                {error
                  ? (error as Error).message
                  : "Unable to retrieve your billing records."}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={isFiltered ? "No matching invoices" : "No invoices yet"}
          description={
            isFiltered
              ? "No billing records match the selected status filter."
              : "Invoices will appear here once your field service appointments are completed and billed."
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
              <Link
                href="/customer/requests/new"
                className={cn(
                  buttonVariants({ variant: "cta", size: "sm" }),
                  "gap-1.5 text-xs font-semibold shadow-xs",
                )}
              >
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
