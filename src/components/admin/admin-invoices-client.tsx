"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ExternalLink, FilePlus, Inbox } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { CreateInvoiceDialog } from "@/components/admin/create-invoice-dialog";
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
import { formatCurrencyCents } from "@/lib/format-currency";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { InvoiceStatus, InvoiceSummary } from "@/types/api";

export function AdminInvoicesClient() {
  const { filters, updateFilters } = useUrlFilters();
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const statusFilter = (filters.status as InvoiceStatus) || undefined;
  const page = filters.page || 1;
  const limit = filters.limit || 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["invoices", { status: statusFilter, page, limit }],
    queryFn: () =>
      financeService.fetchInvoices({ status: statusFilter, page, limit }),
    placeholderData: (previousData) => previousData,
    staleTime: 15000,
  });

  const items = data?.data || [];
  const pagination = data?.pagination;

  const columns: ColumnDef<InvoiceSummary>[] = [
    {
      id: "invoiceNumber",
      header: "Invoice #",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-charcoal-900 dark:text-charcoal-100">
            {item.invoiceNumber || item.id.slice(0, 8)}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            WO #{item.workOrder?.id?.slice(0, 8) || "—"}
          </span>
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
      id: "total",
      header: "Total Amount",
      cell: (item) => (
        <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">
          {formatCurrencyCents(item.totalCents, item.currency)}
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
      header: "Created Date",
      cell: (item) => (
        <span className="text-xs text-muted-foreground">
          {formatSafeDate(item.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      className: "text-right",
      cell: (item) => (
        <Link
          href={`/admin/invoices/${item.id}`}
          className={cn(
            buttonVariants({
              size: "sm",
              variant: item.status === "DRAFT" ? "default" : "outline",
            }),
            "text-xs h-8 gap-1.5 shadow-2xs",
          )}
        >
          <span>{item.status === "DRAFT" ? "Review & Issue" : "View"}</span>
          <ExternalLink className="size-3.5" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar & Create Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border flex-wrap">
          <Button
            size="sm"
            variant={statusFilter === undefined ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ status: undefined, page: 1 })}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "DRAFT" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ status: "DRAFT", page: 1 })}
          >
            Draft
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "ISSUED" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ status: "ISSUED", page: 1 })}
          >
            Issued
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "PAID" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ status: "PAID", page: 1 })}
          >
            Paid
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "VOID" ? "default" : "ghost"}
            className="text-xs h-8 rounded-lg"
            onClick={() => updateFilters({ status: "VOID", page: 1 })}
          >
            Void
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="gap-1.5 shadow-2xs text-xs h-8"
        >
          <FilePlus className="size-3.5" />
          <span>Create Invoice</span>
        </Button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && !data && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
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
                Failed to load invoices
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An error occurred fetching invoices."}
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

      {/* Invoices List */}
      {!isLoading && !isError && (
        <>
          <ResponsiveDataList
            items={items}
            keyExtractor={(item) => item.id}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Inbox}
                title="No Invoices Found"
                description={
                  statusFilter
                    ? "No invoices found for the selected status filter."
                    : "No invoices have been generated yet. Click 'Create Invoice' to bill a completed work order."
                }
              />
            }
            mobileCardRender={(item) => (
              <Card className="p-4 border border-border bg-card shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-charcoal-900 dark:text-charcoal-100">
                      {item.invoiceNumber || item.id.slice(0, 8)}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Customer: {item.customer?.name || "Customer"}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="flex items-center justify-between border-y border-border/50 py-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Total Amount
                    </span>
                    <span className="font-bold text-charcoal-900 dark:text-charcoal-100 text-sm">
                      {formatCurrencyCents(item.totalCents, item.currency)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase">
                      Created
                    </span>
                    <span className="text-charcoal-800 dark:text-charcoal-200">
                      {formatSafeDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <Link
                    href={`/admin/invoices/${item.id}`}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant:
                          item.status === "DRAFT" ? "default" : "outline",
                      }),
                      "text-xs h-8 gap-1.5",
                    )}
                  >
                    <span>
                      {item.status === "DRAFT"
                        ? "Review & Issue"
                        : "View Invoice"}
                    </span>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
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
        </>
      )}

      {/* Create Invoice Dialog Modal */}
      <CreateInvoiceDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
