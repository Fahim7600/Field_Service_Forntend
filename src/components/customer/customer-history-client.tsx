"use client";

import { useQuery } from "@tanstack/react-query";
import { Archive, ArrowRight, History, Receipt, Search } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { extractArray } from "@/lib/extract-data";
import { formatCurrencyCents } from "@/lib/format-currency";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import { requestsService } from "@/services/requests.service";
import type { InvoiceSummary, ServiceRequestListItem } from "@/types/api";

export function CustomerHistoryClient() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("all");

  // Fetch Requests
  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    isError: isRequestsError,
  } = useQuery({
    queryKey: ["customer-history-requests"],
    queryFn: () => requestsService.fetchMyRequests({ limit: 50 }),
  });

  // Fetch Invoices
  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
    isError: isInvoicesError,
  } = useQuery({
    queryKey: ["customer-history-invoices"],
    queryFn: () =>
      financeService.fetchInvoices({
        limit: 50,
        sortBy: "createdAt",
        order: "desc",
      }),
  });

  const allRequests = extractArray<ServiceRequestListItem>(requestsData);
  const allInvoices = extractArray<InvoiceSummary>(invoicesData);

  const completedRequests = allRequests.filter(
    (r) =>
      r.status === "APPROVED" ||
      r.status === "COMPLETED" ||
      r.status === "REJECTED",
  );

  const paidInvoices = allInvoices.filter(
    (i) => i.status === "PAID" || i.status === "ISSUED",
  );

  const filteredRequests = completedRequests.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title?.toLowerCase().includes(term) ||
      r.requestNumber?.toLowerCase().includes(term)
    );
  });

  const filteredInvoices = paidInvoices.filter((i) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      i.invoiceNumber?.toLowerCase().includes(term) ||
      i.status?.toLowerCase().includes(term)
    );
  });

  const isLoading = isRequestsLoading || isInvoicesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service History"
        description="Comprehensive audit trail and history of your completed service requests and billing records."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, request #, or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="all">
            All Records ({filteredRequests.length + filteredInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({filteredRequests.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({filteredInvoices.length})
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders
                key={i}
                className="h-20 w-full rounded-xl"
              />
            ))}
          </div>
        ) : isRequestsError && isInvoicesError ? (
          <EmptyState
            icon={Archive}
            title="Unable to load history"
            description="There was an issue fetching your service history. Please try refreshing."
          />
        ) : (
          <>
            {/* ALL TAB */}
            <TabsContent value="all" className="space-y-4 m-0">
              {filteredRequests.length === 0 &&
              filteredInvoices.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No history found"
                  description={
                    searchTerm
                      ? "No records match your search query."
                      : "You don't have any past service history yet."
                  }
                />
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => (
                    <Card
                      key={`req-${req.id}`}
                      className="hover:shadow-xs transition-shadow"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {req.requestNumber || `#${req.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={req.status} />
                            <Badge variant="outline" className="text-xs">
                              Request
                            </Badge>
                          </div>
                          <h3 className="font-bold text-charcoal-900 dark:text-charcoal-100 text-base">
                            {req.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatSafeDate(req.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/customer/requests/${req.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "shrink-0 self-end sm:self-center",
                          )}
                        >
                          View Request
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredInvoices.map((inv) => (
                    <Card
                      key={`inv-${inv.id}`}
                      className="hover:shadow-xs transition-shadow border-l-4 border-l-brand-500"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {inv.invoiceNumber || `#${inv.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={inv.status} />
                            <Badge variant="secondary" className="text-xs">
                              Invoice
                            </Badge>
                          </div>
                          <h3 className="font-bold text-charcoal-900 dark:text-charcoal-100 text-base">
                            Invoice {inv.invoiceNumber}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Total:{" "}
                            <strong className="text-charcoal-900 dark:text-charcoal-100">
                              {formatCurrencyCents(inv.totalCents)}
                            </strong>{" "}
                            • Date: {formatSafeDate(inv.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/customer/invoices/${inv.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "shrink-0 self-end sm:self-center",
                          )}
                        >
                          View Invoice
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* REQUESTS ONLY TAB */}
            <TabsContent value="requests" className="space-y-4 m-0">
              {filteredRequests.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No completed requests"
                  description="You have no past service requests matching your criteria."
                />
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="hover:shadow-xs transition-shadow"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {req.requestNumber || `#${req.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={req.status} />
                          </div>
                          <h3 className="font-bold text-charcoal-900 dark:text-charcoal-100 text-base">
                            {req.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Created {formatSafeDate(req.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/customer/requests/${req.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "shrink-0 self-end sm:self-center",
                          )}
                        >
                          View Request
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* INVOICES ONLY TAB */}
            <TabsContent value="invoices" className="space-y-4 m-0">
              {filteredInvoices.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No past invoices"
                  description="You have no past invoices matching your criteria."
                />
              ) : (
                <div className="space-y-3">
                  {filteredInvoices.map((inv) => (
                    <Card
                      key={inv.id}
                      className="hover:shadow-xs transition-shadow"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {inv.invoiceNumber || `#${inv.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={inv.status} />
                          </div>
                          <h3 className="font-bold text-charcoal-900 dark:text-charcoal-100 text-base">
                            Invoice {inv.invoiceNumber}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Total:{" "}
                            <strong className="text-charcoal-900 dark:text-charcoal-100">
                              {formatCurrencyCents(inv.totalCents)}
                            </strong>{" "}
                            • Date: {formatSafeDate(inv.createdAt)}
                          </p>
                        </div>
                        <Link
                          href={`/customer/invoices/${inv.id}`}
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "shrink-0 self-end sm:self-center",
                          )}
                        >
                          View Invoice
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
