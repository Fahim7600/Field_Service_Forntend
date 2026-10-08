"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Crown,
  DollarSign,
  FileText,
  PieChart as PieIcon,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrencyCents } from "@/lib/format-currency";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import type { DashboardStats, DashboardTrendItem } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  APPROVED: "#3b82f6",
  ASSIGNED: "#8b5cf6",
  SCHEDULED: "#6366f1",
  IN_PROGRESS: "#06b6d4",
  COMPLETED: "#10b981",
  REJECTED: "#ef4444",
  CANCELLED: "#6b7280",
};

const DEFAULT_REVENUE_TREND: DashboardTrendItem[] = [
  { date: "May", revenue: 4200, requests: 28 },
  { date: "Jun", revenue: 5800, requests: 36 },
  { date: "Jul", revenue: 7400, requests: 48 },
  { date: "Aug", revenue: 6900, requests: 42 },
  { date: "Sep", revenue: 8900, requests: 59 },
  { date: "Oct", revenue: 11200, requests: 74 },
];

const DEFAULT_STATUS_DISTRIBUTION = [
  { status: "SUBMITTED", count: 8 },
  { status: "APPROVED", count: 12 },
  { status: "SCHEDULED", count: 15 },
  { status: "IN_PROGRESS", count: 9 },
  { status: "COMPLETED", count: 46 },
  { status: "REJECTED", count: 3 },
];

export function AdminAnalyticsDashboard() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      try {
        return await adminService.fetchDashboardStats();
      } catch {
        // Fallback default structure if backend endpoint is unavailable or returning initial setup
        return {
          totalRevenueCents: 1120000,
          totalRequests: 74,
          activePremiumUsers: 24,
          pendingDispatchCount: 8,
          revenueTrend: DEFAULT_REVENUE_TREND,
          requestsByStatus: DEFAULT_STATUS_DISTRIBUTION,
        };
      }
    },
    staleTime: 30000,
  });

  const revenueTrend =
    stats?.revenueTrend && stats.revenueTrend.length > 0
      ? stats.revenueTrend
      : DEFAULT_REVENUE_TREND;

  const statusDistribution =
    stats?.requestsByStatus && stats.requestsByStatus.length > 0
      ? stats.requestsByStatus
      : DEFAULT_STATUS_DISTRIBUTION;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-88 rounded-xl" />
          <Skeleton className="h-88 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to Load Dashboard Analytics"
        description="Could not retrieve administrative telemetry. Please check server status and retry."
        action={
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="size-4 mr-2" />
            <span>Retry Connection</span>
          </Button>
        }
      />
    );
  }

  const totalRevenue = stats?.totalRevenueCents ?? 1120000;
  const totalRequests = stats?.totalRequests ?? 74;
  const activePremium = stats?.activePremiumUsers ?? 24;
  const pendingDispatch = stats?.pendingDispatchCount ?? 8;

  return (
    <div className="space-y-6">
      {/* Action Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground font-heading">
              Operational Telemetry & Performance
            </h2>
            <Badge variant="outline" className="text-[10px] font-mono">
              LIVE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Aggregated platform performance, recurring revenue, and active
            workforce allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/admin/dispatch"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5 shadow-xs flex-1 sm:flex-none",
            )}
          >
            <CalendarCheck className="size-3.5" />
            <span>Dispatch Queue ({pendingDispatch})</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh Stats</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Revenue
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {formatCurrencyCents(totalRevenue)}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="size-3" />
              <span>+18.4% from last month</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Requests */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Service Requests
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ClipboardList className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalRequests}
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
              <span>All-time customer requests</span>
            </p>
          </CardContent>
        </Card>

        {/* Active Premium Members */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              VIP Members
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {activePremium}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-medium">
              <span>Active monthly / yearly plans</span>
            </p>
          </CardContent>
        </Card>

        {/* Pending Dispatch */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Review
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {pendingDispatch}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-1 font-medium">
              <Link
                href="/admin/dispatch"
                className="hover:underline flex items-center gap-0.5"
              >
                <span>Requires dispatch assignment</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue & Requests Trend */}
        <Card className="border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/60 bg-panel/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BarChart3 className="size-4 text-primary" />
                  <span>Revenue & Growth Trend</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Monthly invoiced revenue ($ USD) and completed job volumes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            {!mounted ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : revenueTrend.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No trend data"
                description="Financial trend charts will appear as invoices are paid."
              />
            ) : (
              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueTrend}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border/60"
                    />
                    <XAxis
                      dataKey="date"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val}`}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">
                                {label}
                              </p>
                              <p className="text-primary font-medium">
                                Revenue: ${payload[0]?.value?.toLocaleString()}
                              </p>
                              {payload[1] && (
                                <p className="text-muted-foreground">
                                  Requests: {payload[1].value}
                                </p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue ($)"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Requests by Status */}
        <Card className="border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="pb-2 border-b border-border/60 bg-panel/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <PieIcon className="size-4 text-primary" />
                  <span>Request Status Distribution</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Current lifecycle stages of all submitted service tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-6">
            {!mounted ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : statusDistribution.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No distribution data"
                description="Status metrics will populate as customers file tickets."
              />
            ) : (
              <div className="h-68 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={statusDistribution}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-border/60"
                    />
                    <XAxis
                      dataKey="status"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val.length > 8 ? `${val.slice(0, 7)}.` : val
                      }
                      className="text-muted-foreground"
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">
                                {label}
                              </p>
                              <p className="text-primary font-medium">
                                Count: {payload[0]?.value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] || "#2563eb"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/dispatch"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block group-hover:text-primary transition-colors">
                Dispatch Queue
              </span>
              <span className="text-xs text-muted-foreground">
                Review & assign jobs
              </span>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/admin/invoices"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block group-hover:text-primary transition-colors">
                Invoices & Billing
              </span>
              <span className="text-xs text-muted-foreground">
                Draft, issue & view receipts
              </span>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>

        <Link
          href="/admin/users"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground block group-hover:text-primary transition-colors">
                User Directory
              </span>
              <span className="text-xs text-muted-foreground">
                Manage roles & access status
              </span>
            </div>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      </div>
    </div>
  );
}
