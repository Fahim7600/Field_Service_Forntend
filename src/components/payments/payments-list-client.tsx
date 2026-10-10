"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpDown,
  CreditCard,
  Eye,
  HelpCircle,
  Receipt,
  RefreshCw,
  RotateCcw,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { RefundPaymentDialog } from "@/components/admin/refund-payment-dialog";
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
import { formatMoney, safeFormatDateTime } from "@/lib/format";
import { humanizeEnum } from "@/lib/humanize";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { Payment, PaymentSortBy, PaymentStatus } from "@/types/finance";

const PAYMENT_STATUS_CHIPS: Array<{
  label: string;
  value: PaymentStatus | "ALL";
}> = [
  { label: "All Transactions", value: "ALL" },
  { label: "Succeeded", value: "SUCCEEDED" },
  { label: "Pending", value: "PENDING" },
  { label: "Failed", value: "FAILED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

export interface PaymentsListClientProps {
  variant: "customer" | "admin";
}

export function PaymentsListClient({ variant }: PaymentsListClientProps) {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    order: "desc",
  });

  const [selectedRefundPayment, setSelectedRefundPayment] =
    React.useState<Payment | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);

  const rawStatus = filters.status ? String(filters.status).toUpperCase() : "";
  const statusFilter =
    rawStatus && rawStatus !== "ALL" ? (rawStatus as PaymentStatus) : undefined;
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const sortBy = (filters.sortBy || "createdAt") as PaymentSortBy;
  const order = (filters.order || "desc") as "asc" | "desc";

  const sortValue =
    sortBy === "amountCents" && order === "desc"
      ? "highest_amount"
      : sortBy === "createdAt" && order === "asc"
        ? "oldest"
        : "newest";

  const queryKey = [
    variant,
    "payments",
    { status: statusFilter, page, limit, sortBy, order },
  ];

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      financeService.fetchPayments({
        status: statusFilter,
        page,
        limit,
        sortBy,
        order,
      }),
    staleTime: 15000,
  });

  const items = data?.items ?? extractArray<Payment>(data);
  const pagination = data?.meta ?? data?.pagination;

  const handleSortChange = (value: string) => {
    if (value === "highest_amount") {
      updateFilters({ sortBy: "amountCents", order: "desc", page: 1 });
    } else if (value === "oldest") {
      updateFilters({ sortBy: "createdAt", order: "asc", page: 1 });
    } else {
      updateFilters({ sortBy: "createdAt", order: "desc", page: 1 });
    }
  };

  const handleStatusChange = (statusVal: PaymentStatus | "ALL") => {
    updateFilters({
      status: statusVal === "ALL" ? undefined : statusVal,
      page: 1,
    });
  };

  const isFiltered = Boolean(statusFilter);

  const handleOpenRefund = (payment: Payment) => {
    setSelectedRefundPayment(payment);
    setIsRefundDialogOpen(true);
  };

  const invoiceBasePath =
    variant === "admin" ? "/admin/invoices" : "/customer/invoices";

  // Table Columns Definition
  const columns: ColumnDef<Payment>[] = [
    {
      id: "date",
      header: "Date & Time",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground text-xs">
            {safeFormatDateTime(item.createdAt)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            ID: {item.id.slice(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      id: "invoice",
      header: "Invoice Reference",
      cell: (item) => {
        const invoiceId = item.invoice?.id ?? item.invoiceId;
        const invoiceNum =
          item.invoice?.invoiceNumber ??
          (invoiceId ? `INV-${invoiceId.slice(0, 8)}` : null);
        const invoiceType = item.invoice?.type;
        const isNonMain =
          Boolean(invoiceType) && invoiceType?.toUpperCase() !== "MAIN";

        if (invoiceId) {
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`${invoiceBasePath}/${invoiceId}`}
                className="font-mono text-xs font-semibold text-primary hover:underline"
              >
                {invoiceNum ?? "Invoice"}
              </Link>
              {isNonMain && invoiceType && (
                <Badge
                  variant="outline"
                  className="text-[10px] py-0 px-1 font-normal text-muted-foreground bg-muted/50 border-border"
                >
                  {humanizeEnum(invoiceType)}
                </Badge>
              )}
            </div>
          );
        }
        return <span className="text-xs text-muted-foreground">—</span>;
      },
    },
    {
      id: "amount",
      header: "Amount",
      cell: (item) => (
        <span
          className={cn(
            "font-mono font-bold text-xs",
            item.status === "REFUNDED"
              ? "text-purple-700 dark:text-purple-300"
              : "text-foreground",
          )}
        >
          {item.status === "REFUNDED" && "-"}
          {formatMoney(item.amountCents)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (item) => (
        <div className="flex flex-col gap-0.5">
          <StatusBadge status={item.status} />
          {item.status === "FAILED" && item.failureReason && (
            <span
              className="text-[10px] text-destructive max-w-[160px] truncate"
              title={item.failureReason}
            >
              {item.failureReason}
            </span>
          )}
          {item.status === "REFUNDED" && item.refundedAt && (
            <span className="text-[10px] text-muted-foreground">
              {safeFormatDateTime(item.refundedAt)}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      className: "text-right",
      cell: (item) => {
        const invoiceId = item.invoice?.id ?? item.invoiceId;
        const isSucceeded = item.status === "SUCCEEDED";
        const isPending = item.status === "PENDING";

        if (variant === "admin") {
          return (
            <div className="flex items-center justify-end gap-2">
              {invoiceId && (
                <Link
                  href={`${invoiceBasePath}/${invoiceId}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-8 px-2.5 text-xs gap-1.5 font-medium",
                  )}
                >
                  <Eye className="size-3.5" />
                  <span>Invoice</span>
                </Link>
              )}

              {isSucceeded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenRefund(item)}
                  className="h-8 px-2.5 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-medium"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Refund</span>
                </Button>
              )}
            </div>
          );
        }

        // Customer variant actions
        return (
          <div className="flex items-center justify-end gap-2">
            {isPending && invoiceId ? (
              <div className="flex items-center gap-1.5">
                <Link
                  href={`${invoiceBasePath}/${invoiceId}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs",
                  )}
                >
                  <CreditCard className="size-3.5" />
                  <span>Complete Payment</span>
                </Link>
              </div>
            ) : invoiceId ? (
              <Link
                href={`${invoiceBasePath}/${invoiceId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 px-2.5 text-xs gap-1.5 font-medium",
                )}
              >
                <Eye className="size-3.5" />
                <span>View Invoice</span>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        );
      },
    },
  ];

  // Mobile Card View
  const renderMobileCard = (item: Payment) => {
    const isSucceeded = item.status === "SUCCEEDED";
    const isPending = item.status === "PENDING";
    const invoiceId = item.invoice?.id ?? item.invoiceId;
    const invoiceNum =
      item.invoice?.invoiceNumber ??
      (invoiceId
        ? `INV-${invoiceId.slice(0, 8)}`
        : `TX-${item.id.slice(0, 8)}`);
    const invoiceType = item.invoice?.type;
    const isNonMain =
      Boolean(invoiceType) && invoiceType?.toUpperCase() !== "MAIN";

    return (
      <Card className="border-border shadow-xs hover:border-border/80 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-foreground">
                  {invoiceNum}
                </span>
                {isNonMain && invoiceType && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1 font-normal text-muted-foreground bg-muted/50 border-border"
                  >
                    {humanizeEnum(invoiceType)}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {safeFormatDateTime(item.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <StatusBadge status={item.status} />
              {item.status === "FAILED" && item.failureReason && (
                <span className="text-[10px] text-destructive max-w-[140px] truncate text-right">
                  {item.failureReason}
                </span>
              )}
              {item.status === "REFUNDED" && item.refundedAt && (
                <span className="text-[10px] text-muted-foreground text-right">
                  {safeFormatDateTime(item.refundedAt)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs py-2 border-y border-border/50">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Amount
              </span>
              <span
                className={cn(
                  "font-bold font-mono text-sm",
                  item.status === "REFUNDED"
                    ? "text-purple-700 dark:text-purple-300"
                    : "text-foreground",
                )}
              >
                {item.status === "REFUNDED" && "-"}
                {formatMoney(item.amountCents)}
              </span>
            </div>
          </div>

          {isPending && variant === "customer" && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <HelpCircle className="size-3.5 shrink-0" />
              <span>Checkout was started but not yet completed.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            {invoiceId && (
              <Link
                href={`${invoiceBasePath}/${invoiceId}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 px-3 text-xs gap-1.5 font-medium flex-1 sm:flex-initial justify-center",
                )}
              >
                <Eye className="size-3.5" />
                <span>View Invoice</span>
              </Link>
            )}

            {isPending && variant === "customer" && invoiceId && (
              <Link
                href={`${invoiceBasePath}/${invoiceId}`}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "h-8 px-3 text-xs gap-1.5 font-semibold shadow-xs flex-1 sm:flex-initial justify-center",
                )}
              >
                <CreditCard className="size-3.5" />
                <span>Pay Now</span>
              </Link>
            )}

            {variant === "admin" && isSucceeded && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenRefund(item)}
                className="h-8 px-3 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive font-medium flex-1 sm:flex-initial justify-center"
              >
                <RotateCcw className="size-3.5" />
                <span>Refund</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs / Title Context */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          {variant === "admin" ? (
            <Wallet className="size-4" />
          ) : (
            <CreditCard className="size-4" />
          )}
          <span>Transactions &amp; Receipts</span>
        </div>

        {variant === "customer" && (
          <Link
            href="/customer/invoices"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-medium transition-colors"
          >
            <Receipt className="size-3.5" />
            <span>Go to Invoices</span>
          </Link>
        )}
      </div>

      {/* Filters & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {PAYMENT_STATUS_CHIPS.map((chip) => {
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
              <SelectItem value="highest_amount" className="text-xs">
                Highest Amount
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Refresh transactions"
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
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load transactions"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={isFiltered ? "No matching transactions" : "No payment history"}
          description={
            isFiltered
              ? "No payment records match the selected status filter."
              : variant === "admin"
                ? "Customer payment transactions processed via Stripe will be listed here."
                : "Your invoice payment receipts and Stripe checkout transactions will appear here."
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
            ) : variant === "customer" ? (
              <Link
                href="/customer/invoices"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs font-semibold",
                )}
              >
                <span>View Invoices</span>
              </Link>
            ) : undefined
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

      {/* Admin Refund Modal */}
      {variant === "admin" && (
        <RefundPaymentDialog
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          payment={selectedRefundPayment}
          invoiceNumber={
            selectedRefundPayment?.invoice?.invoiceNumber ??
            (selectedRefundPayment?.invoice?.id
              ? `INV-${selectedRefundPayment.invoice.id.slice(0, 8)}`
              : selectedRefundPayment?.invoiceId
                ? `INV-${selectedRefundPayment.invoiceId.slice(0, 8)}`
                : undefined)
          }
          onRefundSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
