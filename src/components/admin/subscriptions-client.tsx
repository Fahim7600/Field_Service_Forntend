"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  AlertTriangle,
  Crown,
  FilterX,
  RefreshCw,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  type ColumnDef,
  ResponsiveDataList,
} from "@/components/shared/responsive-data-list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminLogsService } from "@/services/admin-logs.service";
import type {
  SubscriptionListItem,
  SubscriptionListParams,
} from "@/types/admin";

function ActiveMembersCard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-subscriptions-count-active"],
    queryFn: () =>
      adminLogsService.fetchSubscriptions({
        status: "ACTIVE",
        limit: 1,
      }),
    staleTime: 30000,
  });

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (isError) {
    return (
      <Card className="p-4 border-destructive/30 bg-destructive/5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-destructive font-semibold">
            Active Count Error
          </p>
          <p className="text-[11px] text-muted-foreground">
            Failed to load count
          </p>
        </div>
        <Button size="icon-sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
        </Button>
      </Card>
    );
  }

  const count = data?.pagination?.total ?? 0;

  return (
    <Card className="p-4 border border-emerald-500/20 bg-emerald-500/5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
            Active Members
          </span>
          <p className="text-2xl font-black text-emerald-950 dark:text-emerald-50">
            {count}
          </p>
        </div>
        <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
          <Crown className="size-5" />
        </div>
      </div>
    </Card>
  );
}

function PastDueCard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-subscriptions-count-pastdue"],
    queryFn: () =>
      adminLogsService.fetchSubscriptions({
        status: "PAST_DUE",
        limit: 1,
      }),
    staleTime: 30000,
  });

  if (isLoading) {
    return <Skeleton className="h-24 w-full rounded-xl" />;
  }

  if (isError) {
    return (
      <Card className="p-4 border-destructive/30 bg-destructive/5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs text-destructive font-semibold">
            Past Due Count Error
          </p>
          <p className="text-[11px] text-muted-foreground">
            Failed to load count
          </p>
        </div>
        <Button size="icon-sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="size-3.5" />
        </Button>
      </Card>
    );
  }

  const count = data?.pagination?.total ?? 0;

  return (
    <Card className="p-4 border border-amber-500/20 bg-amber-500/5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            Past Due
          </span>
          <p className="text-2xl font-black text-amber-950 dark:text-amber-50">
            {count}
          </p>
        </div>
        <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
          <AlertTriangle className="size-5" />
        </div>
      </div>
    </Card>
  );
}

export function SubscriptionsClient() {
  const { filters, updateFilters, resetFilters } = useUrlFilters({
    page: 1,
    limit: 10,
  });

  const statusParam = (filters.status as string) || "ALL";
  const page = filters.page || 1;

  const isFiltered = statusParam !== "ALL";

  const queryParams: SubscriptionListParams = {
    page,
    limit: 10,
    status: statusParam !== "ALL" ? statusParam : undefined,
    sortBy: "createdAt",
    order: "desc",
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-subscriptions", queryParams],
    queryFn: () => adminLogsService.fetchSubscriptions(queryParams),
    staleTime: 10000,
  });

  const subscriptions = extractArray<SubscriptionListItem>(data);
  const pagination = data?.pagination;

  const handleStatusChange = (val: string) => {
    updateFilters({
      status: val === "ALL" ? undefined : val,
      page: 1,
    });
  };

  const columns: ColumnDef<SubscriptionListItem>[] = [
    {
      header: "Customer",
      cell: (item) => {
        const name =
          item.customer?.name ||
          item.user?.name ||
          item.customerName ||
          `User ${item.userId.slice(0, 8)}`;
        const email =
          item.customer?.email || item.user?.email || item.customerEmail || "";

        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="size-9 rounded-full border border-border shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5 min-w-0">
              <span className="font-semibold text-sm text-foreground truncate block">
                {name}
              </span>
              {email && (
                <p className="text-xs text-muted-foreground truncate">
                  {email}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Plan Tier",
      className: "w-44",
      cell: (item) => {
        const planName = item.plan?.name || item.planName || "VIP Premium";
        const interval = item.plan?.interval || item.planInterval || "Monthly";

        return (
          <div className="space-y-0.5">
            <span className="font-semibold text-sm text-foreground block">
              {planName}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {interval.toLowerCase()} billing
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      className: "w-36",
      cell: (item) => {
        const isCancelled =
          item.status === "CANCELLED" || item.cancelAtPeriodEnd;

        return (
          <div className="space-y-1">
            <StatusBadge status={item.status} />
            {isCancelled && item.currentPeriodEnd && (
              <span className="text-[10px] text-muted-foreground block">
                Ends {safeFormatDate(item.currentPeriodEnd)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Renews / Ends",
      className: "w-36 text-xs text-muted-foreground",
      cell: (item) => safeFormatDate(item.currentPeriodEnd),
    },
    {
      header: "Started",
      className: "w-36 text-xs text-muted-foreground",
      cell: (item) => safeFormatDate(item.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top 2 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ActiveMembersCard />
        <PastDueCard />
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <Tabs
          value={statusParam}
          onValueChange={handleStatusChange}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-3 sm:flex w-full sm:w-auto">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="ACTIVE">Active</TabsTrigger>
            <TabsTrigger value="PAST_DUE">Past Due</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
            <TabsTrigger value="EXPIRED">Expired</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-end gap-2">
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="size-3.5 mr-1" />
              Reset
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
            title="Refresh subscriptions"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh subscriptions</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error Card */}
      {isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">
                Failed to load subscriptions
              </h3>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while loading member subscriptions."}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Data List */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          <ResponsiveDataList
            items={subscriptions}
            keyExtractor={(item) => item.id}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Crown}
                title={
                  isFiltered
                    ? "No matching subscriptions"
                    : "No subscriptions yet"
                }
                description={
                  isFiltered
                    ? "No customer subscriptions match your selected filter."
                    : "When customers subscribe to a premium plan, their memberships will be listed here."
                }
                action={
                  isFiltered ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            }
            mobileCardRender={(item) => {
              const name =
                item.customer?.name ||
                item.user?.name ||
                item.customerName ||
                `User ${item.userId.slice(0, 8)}`;
              const email =
                item.customer?.email ||
                item.user?.email ||
                item.customerEmail ||
                "";
              const planName =
                item.plan?.name || item.planName || "VIP Premium";
              const interval =
                item.plan?.interval || item.planInterval || "Monthly";
              const isCancelled =
                item.status === "CANCELLED" || item.cancelAtPeriodEnd;

              return (
                <Card className="p-4 border border-border bg-card shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-8 rounded-full border border-border shrink-0">
                        <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                          {name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-foreground truncate block">
                          {name}
                        </span>
                        {email && (
                          <p className="text-xs text-muted-foreground truncate">
                            {email}
                          </p>
                        )}
                      </div>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">
                        {planName}
                      </span>
                      <span className="text-muted-foreground block text-[11px] capitalize">
                        {interval.toLowerCase()} billing
                      </span>
                    </div>

                    <div className="text-right text-muted-foreground">
                      <span>
                        {isCancelled ? "Ends" : "Renews"}{" "}
                        {safeFormatDate(item.currentPeriodEnd)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            }}
          />

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
