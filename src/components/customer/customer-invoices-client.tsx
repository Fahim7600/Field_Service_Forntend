"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  Receipt,
  Search,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { formatCurrencyCents } from "@/lib/format-currency";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type {
  InvoiceStatus,
  InvoiceSummary,
  InvoicesQueryParams,
} from "@/types/api";

export function CustomerInvoicesClient() {
  const { filters, updateFilters } = useUrlFilters();

  const statusParam = (filters.status as InvoiceStatus | "ALL") || "ALL";
  const searchParam = (filters.search as string) || "";
  const pageParam = filters.page || 1;

  const [searchInput, setSearchInput] = React.useState(searchParam);

  const queryParams: InvoicesQueryParams = {
    page: pageParam,
    limit: 10,
    status: statusParam !== "ALL" ? statusParam : undefined,
    sortBy: "createdAt:desc",
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["customer-invoices", queryParams],
    queryFn: () => financeService.fetchInvoices(queryParams),
    staleTime: 15000,
  });

  const invoices = extractArray<InvoiceSummary>(data);
  const pagination = data?.pagination;

  const handleStatusChange = (val: string) => {
    updateFilters({ status: val === "ALL" ? undefined : val, page: 1 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Tabs
          value={statusParam}
          onValueChange={handleStatusChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="ISSUED">To Pay</TabsTrigger>
            <TabsTrigger value="PAID">Paid</TabsTrigger>
            <TabsTrigger value="DRAFT">Draft</TabsTrigger>
          </TabsList>
        </Tabs>

        <form
          onSubmit={handleSearchSubmit}
          className="flex w-full sm:w-72 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search invoice #..."
              className="pl-9 h-9 text-xs"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-9 px-3"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading items
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/40 bg-destructive/5 p-6 text-center">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load invoices
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && invoices.length === 0 && (
        <Card className="border-dashed border-border p-12 text-center">
          <CardContent className="space-y-3 p-0">
            <Receipt className="size-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                No invoices found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {statusParam === "ISSUED"
                  ? "Great news! You have no outstanding invoices to pay."
                  : "Invoices generated for completed service requests will appear here."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List / Cards */}
      {!isLoading && !isError && invoices.length > 0 && (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const isIssued = invoice.status === "ISSUED";

            return (
              <Card
                key={invoice.id}
                className={cn(
                  "border-border bg-card transition-all hover:border-primary/40 shadow-xs",
                  isIssued && "border-amber-500/40 bg-amber-500/[0.02]",
                )}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm text-foreground">
                        Invoice #
                        {invoice.invoiceNumber || invoice.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={invoice.status} />
                      {isIssued && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] animate-pulse"
                        >
                          Payment Due
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>
                        Date:{" "}
                        {formatSafeDate(invoice.issuedAt || invoice.createdAt)}
                      </span>
                      {invoice.workOrder && (
                        <span>
                          Work Order:{" "}
                          <span className="font-mono">
                            #{invoice.workOrder.id.slice(0, 8)}
                          </span>
                        </span>
                      )}
                      {invoice.paidAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Paid: {formatSafeDate(invoice.paidAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Total & CTA */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                        Total Amount
                      </span>
                      <span className="font-mono font-bold text-base text-foreground">
                        {formatCurrencyCents(
                          invoice.totalCents,
                          invoice.currency,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/customer/invoices/${invoice.id}`}
                        className={cn(
                          buttonVariants({
                            variant: isIssued ? "default" : "outline",
                            size: "sm",
                          }),
                          "gap-1.5",
                        )}
                      >
                        {isIssued ? (
                          <>
                            <CreditCard className="size-3.5" />
                            <span>Pay Now</span>
                          </>
                        ) : (
                          <>
                            <span>View Details</span>
                            <ArrowRight className="size-3.5" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <span>
            Page {pagination.page} of {pagination.totalPages} (
            {pagination.total} total)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => updateFilters({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateFilters({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
