"use client";

import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  RefreshCw,
  Timer,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { ChartCard } from "@/components/charts/chart-card";
import { StatusBarChartLazy } from "@/components/charts/status-bar-chart.lazy";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { useTechnicianPerformance } from "@/hooks/use-technician-performance";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function TechnicianPerformanceClient() {
  const { stats, isLoading, isError, error, isFetching, refetch } =
    useTechnicianPerformance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-24" />
        </div>

        {/* 4 Stat Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["s1", "s2", "s3", "s4"].map((key) => (
            <Skeleton key={key} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Charts & Lists Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <QueryError
        error={error}
        onRetry={() => refetch()}
        title="Failed to load performance metrics"
      />
    );
  }

  const chartData = stats.countsByStatus.map((item) => ({
    label: item.status,
    value: item.count,
  }));

  const hasHoursCard = stats.hoursLogged !== null;
  const nextThreeVisits = stats.upcomingVisits.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="My performance"
        description="A summary of your jobs"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 shadow-2xs"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>
        }
      />

      {/* Truncation notice if pagination limit was reached */}
      {stats.isTruncated && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0 text-muted-foreground/80" />
          <span>Based on your latest 100 jobs</span>
        </div>
      )}

      {/* Top Stat Cards (2 columns on mobile, 4 on lg if hours present, else 3) */}
      <div
        className={cn(
          "grid grid-cols-2 gap-4",
          hasHoursCard ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {/* Card 1: Jobs Completed */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jobs Completed
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {stats.completedCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Finished assignments
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Active Jobs */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Jobs
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wrench className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {stats.activeCount.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Assigned, arrived, or in progress
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Upcoming Visits */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Visits
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {stats.upcomingVisits.length.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Scheduled on your calendar
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Hours Logged (Only rendered if hours data is present) */}
        {hasHoursCard && (
          <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hours Logged
              </CardTitle>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Timer className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
                {stats.hoursLogged?.toFixed(1)} h
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                From completed service reports
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart Section: Jobs by Status */}
      <ChartCard
        title="Jobs by status"
        description="Lifecycle breakdown across all your assigned work orders."
        icon={BarChart3}
      >
        <StatusBarChartLazy
          data={chartData}
          height={260}
          ariaLabel="Chart showing distribution of your assigned work orders by status"
          emptyTitle="No jobs yet"
          emptyDescription="Job breakdown will populate as service tasks are assigned to you."
        />
      </ChartCard>

      {/* 2 Detail Sections: Next Visits & Recently Completed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Visits Card */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/50 bg-panel/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground font-heading">
                  <Calendar className="size-4 text-primary" />
                  <span>Next visits</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Your upcoming on-site appointments
                </CardDescription>
              </div>
              <Link
                href="/technician/schedule"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs gap-1.5 h-8",
                )}
              >
                <span>View schedule</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {nextThreeVisits.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming visits"
                description="You have no scheduled visits in the future."
                className="border-0 shadow-none py-6"
              />
            ) : (
              <div className="space-y-3">
                {nextThreeVisits.map((visit) => {
                  const visitDateStr = visit.visitStart || visit.scheduledDate;
                  const formattedDate = safeFormatDateTime(visitDateStr);
                  const woLabel =
                    visit.workOrderNumber || `WO-${visit.id.slice(0, 8)}`;
                  const address = visit.request?.address;

                  return (
                    <Link
                      key={visit.id}
                      href={`/technician/tasks/${visit.id}`}
                      className="block p-3.5 rounded-lg border border-border bg-panel/20 hover:bg-panel/50 transition-colors group space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-foreground font-mono group-hover:text-primary transition-colors">
                          {woLabel}
                        </span>
                        <StatusBadge status={visit.status} />
                      </div>

                      <div className="text-xs text-foreground font-medium">
                        {visit.request?.title || "Service task"}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-muted-foreground/80" />
                          <span className="tabular-nums">{formattedDate}</span>
                        </div>
                        {address && (
                          <div className="flex items-center gap-1 max-w-[160px] truncate">
                            <MapPin className="size-3 shrink-0 text-muted-foreground/80" />
                            <span className="truncate">{address}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Completed Card */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border/50 bg-panel/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground font-heading">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Recently completed</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Latest finished assignments and reports
                </CardDescription>
              </div>
              <Link
                href="/technician/tasks"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-xs gap-1.5 h-8",
                )}
              >
                <span>All tasks</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {stats.recentCompleted.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No completed jobs yet"
                description="Completed tasks and filed reports will appear here."
                className="border-0 shadow-none py-6"
              />
            ) : (
              <div className="space-y-3">
                {stats.recentCompleted.map((job) => {
                  const compDate =
                    job.updatedAt ||
                    job.visitEnd ||
                    job.visitStart ||
                    job.createdAt;
                  const dateFormatted = safeFormatDate(compDate);
                  const woLabel =
                    job.workOrderNumber || `WO-${job.id.slice(0, 8)}`;
                  const serviceName =
                    job.request?.title ||
                    job.request?.category?.name ||
                    "Completed service";
                  const hoursSpent = job.serviceReport?.hoursSpent;

                  return (
                    <Link
                      key={job.id}
                      href={`/technician/tasks/${job.id}`}
                      className="block p-3.5 rounded-lg border border-border bg-panel/20 hover:bg-panel/50 transition-colors group space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-foreground font-mono group-hover:text-primary transition-colors">
                          {woLabel}
                        </span>
                        <StatusBadge status={job.status} />
                      </div>

                      <div className="text-xs text-foreground font-medium truncate">
                        {serviceName}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <span>Finished {dateFormatted}</span>
                        {typeof hoursSpent === "number" && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-mono px-1.5 py-0 h-4"
                          >
                            {hoursSpent} h logged
                          </Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Muted Info Card at Bottom */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/60 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
        <p className="leading-relaxed">
          Customer ratings and on-time statistics are reviewed by the dispatch
          team. This system does not include payroll or earnings.
        </p>
      </div>
    </div>
  );
}
