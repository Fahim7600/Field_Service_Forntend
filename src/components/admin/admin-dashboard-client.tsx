"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Clock,
  Crown,
  DollarSign,
  FileText,
  Inbox,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { ChartCard } from "@/components/charts/chart-card";
import { StatusBarChartLazy } from "@/components/charts/status-bar-chart.lazy";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { normalizeRequestsByStatus } from "@/lib/stats-utils";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { adminStatsService } from "@/services/admin-stats.service";
import type { DashboardStats } from "@/types/admin";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  subtext?: string;
  href?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  accent?: "neutral" | "red" | "amber";
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  href,
  isLoading,
  isError,
  onRetry,
  accent = "neutral",
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "border-border bg-card shadow-xs transition-all flex flex-col justify-between h-full",
        href && "hover:border-primary/40 group",
        accent === "red" && "border-destructive/40 bg-destructive/5",
        accent === "amber" && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            accent === "red"
              ? "text-destructive"
              : accent === "amber"
                ? "text-amber-800 dark:text-amber-300"
                : "text-muted-foreground",
          )}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            "size-8 rounded-lg flex items-center justify-center shrink-0",
            accent === "red"
              ? "bg-destructive/15 text-destructive"
              : accent === "amber"
                ? "bg-amber-500/15 text-amber-800 dark:text-amber-300"
                : "bg-muted text-muted-foreground group-hover:text-primary transition-colors",
          )}
        >
          <Icon className="size-4" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex-1 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-2 py-1">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ) : isError ? (
          <div className="space-y-2 py-1">
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>Failed to load</span>
            </p>
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRetry();
                }}
                className="h-6 px-2 text-xs"
              >
                Retry
              </Button>
            )}
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {value}
            </div>
            {subtext && (
              <p
                className={cn(
                  "text-[11px] mt-1 flex items-center gap-1 font-medium",
                  accent === "red"
                    ? "text-destructive"
                    : accent === "amber"
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-muted-foreground",
                )}
              >
                <span>{subtext}</span>
                {href && (
                  <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href && !isLoading && !isError) {
    return (
      <Link href={href} className="block h-full focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
}

export function AdminDashboardClient() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // 1. Total Revenue Query
  const revenueQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminStatsService.fetchDashboardStats(),
    select: (data: DashboardStats) => data.totalRevenueCents ?? 0,
    staleTime: 30000,
  });

  // 2. Total Requests Query
  const requestsQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminStatsService.fetchDashboardStats(),
    select: (data: DashboardStats) => {
      if (typeof data.totalRequests === "number") return data.totalRequests;
      return (data.activeWorkOrders ?? 0) + (data.pendingRequests ?? 0);
    },
    staleTime: 30000,
  });

  // 3. Active Premium Members Query
  const premiumQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminStatsService.fetchDashboardStats(),
    select: (data: DashboardStats) => data.activePremiumUsers ?? 0,
    staleTime: 30000,
  });

  // 4. Late Reviews Query
  const lateReviewsQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminStatsService.fetchDashboardStats(),
    select: (data: DashboardStats) => data.lateReviews ?? 0,
    staleTime: 30000,
  });

  // 5. Awaiting Review (from Dispatch Queue type=REQUEST_REVIEW)
  const awaitingReviewQuery = useQuery({
    queryKey: ["admin-dispatch-queue-count", "REQUEST_REVIEW"],
    queryFn: () =>
      adminService.fetchDispatchQueue({
        type: "REQUEST_REVIEW",
        limit: 1,
      }),
    select: (res) => res.pagination?.total ?? 0,
    staleTime: 30000,
  });

  // 6. Needs Technician (from Dispatch Queue type=NEEDS_TECHNICIAN)
  const needsTechQuery = useQuery({
    queryKey: ["admin-dispatch-queue-count", "NEEDS_TECHNICIAN"],
    queryFn: () =>
      adminService.fetchDispatchQueue({
        type: "NEEDS_TECHNICIAN",
        limit: 1,
      }),
    select: (res) => res.pagination?.total ?? 0,
    staleTime: 30000,
  });

  // 7. Status Chart Data Query
  const statusChartQuery = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminStatsService.fetchDashboardStats(),
    select: (data: DashboardStats) => {
      if (data.requestsByStatus) {
        return normalizeRequestsByStatus(data.requestsByStatus);
      }
      // Fallback distribution from pending / active if available
      const items = [];
      if (data.pendingRequests) {
        items.push({ status: "SUBMITTED", count: data.pendingRequests });
      }
      if (data.activeWorkOrders) {
        items.push({ status: "IN_PROGRESS", count: data.activeWorkOrders });
      }
      return normalizeRequestsByStatus(items);
    },
    staleTime: 30000,
  });

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] }),
        queryClient.invalidateQueries({
          queryKey: ["admin-dispatch-queue-count"],
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const chartData = (statusChartQuery.data ?? []).map((item) => ({
    label: item.status,
    value: item.count,
  }));

  const lateReviewsCount = lateReviewsQuery.data ?? 0;
  const awaitingReviewCount = awaitingReviewQuery.data ?? 0;
  const needsTechCount = needsTechQuery.data ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Header with Refresh Button */}
      <PageHeader
        title="Admin dashboard"
        description="High-level operational metrics, dispatch activity, and platform status."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="gap-1.5 shadow-2xs"
          >
            <RefreshCw
              className={cn("size-3.5", isRefreshing && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* 6 Independent Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Revenue */}
        <StatCard
          title="Total revenue"
          value={formatMoney(revenueQuery.data)}
          icon={DollarSign}
          subtext="Invoiced revenue"
          isLoading={revenueQuery.isLoading}
          isError={revenueQuery.isError}
          onRetry={() => revenueQuery.refetch()}
        />

        {/* Card 2: Total Requests */}
        <StatCard
          title="Total requests"
          value={(requestsQuery.data ?? 0).toLocaleString()}
          icon={ClipboardList}
          subtext="Lifetime requests"
          isLoading={requestsQuery.isLoading}
          isError={requestsQuery.isError}
          onRetry={() => requestsQuery.refetch()}
        />

        {/* Card 3: Active Premium Members */}
        <StatCard
          title="Active premium"
          value={(premiumQuery.data ?? 0).toLocaleString()}
          icon={Crown}
          subtext="View subscriptions"
          href="/admin/subscriptions"
          isLoading={premiumQuery.isLoading}
          isError={premiumQuery.isError}
          onRetry={() => premiumQuery.refetch()}
        />

        {/* Card 4: Late Reviews */}
        <StatCard
          title="Late reviews"
          value={lateReviewsCount.toLocaleString()}
          icon={Clock}
          subtext={lateReviewsCount > 0 ? "Requires review" : "Up to date"}
          href="/admin/dispatch?type=REQUEST_REVIEW"
          accent={lateReviewsCount > 0 ? "red" : "neutral"}
          isLoading={lateReviewsQuery.isLoading}
          isError={lateReviewsQuery.isError}
          onRetry={() => lateReviewsQuery.refetch()}
        />

        {/* Card 5: Awaiting Review */}
        <StatCard
          title="Awaiting review"
          value={awaitingReviewCount.toLocaleString()}
          icon={Inbox}
          subtext="Open in dispatch"
          href="/admin/dispatch"
          accent={awaitingReviewCount > 0 ? "amber" : "neutral"}
          isLoading={awaitingReviewQuery.isLoading}
          isError={awaitingReviewQuery.isError}
          onRetry={() => awaitingReviewQuery.refetch()}
        />

        {/* Card 6: Needs Technician */}
        <StatCard
          title="Needs technician"
          value={needsTechCount.toLocaleString()}
          icon={UserCheck}
          subtext="Assign technician"
          href="/admin/dispatch?type=NEEDS_TECHNICIAN"
          accent={needsTechCount > 0 ? "amber" : "neutral"}
          isLoading={needsTechQuery.isLoading}
          isError={needsTechQuery.isError}
          onRetry={() => needsTechQuery.refetch()}
        />
      </div>

      {/* Requests by Status Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            title="Requests by status"
            description="Breakdown of service requests across current operational stages."
            icon={BarChart3}
          >
            <StatusBarChartLazy
              data={chartData}
              height={260}
              ariaLabel="Requests categorized by operational status"
              emptyTitle="No request status data"
              emptyDescription="Status distribution will populate as service requests are created."
            />
          </ChartCard>
        </div>

        {/* Quick Actions Card */}
        <div>
          <Card className="border-border bg-card shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-border/50 bg-panel/30">
              <CardTitle className="text-sm font-semibold text-foreground font-heading">
                Quick actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-center">
              <Link
                href="/admin/dispatch"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full justify-between gap-2 shadow-2xs",
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarCheck className="size-4" />
                  <span>Dispatch Queue</span>
                </span>
                <ArrowUpRight className="size-4 opacity-70" />
              </Link>

              <Link
                href="/admin/work-orders"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between gap-2 shadow-2xs",
                )}
              >
                <span className="flex items-center gap-2">
                  <ClipboardList className="size-4" />
                  <span>Work Orders</span>
                </span>
                <ArrowUpRight className="size-4 opacity-70" />
              </Link>

              <Link
                href="/admin/invoices"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-between gap-2 shadow-2xs",
                )}
              >
                <span className="flex items-center gap-2">
                  <FileText className="size-4" />
                  <span>Invoices & Billing</span>
                </span>
                <ArrowUpRight className="size-4 opacity-70" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
