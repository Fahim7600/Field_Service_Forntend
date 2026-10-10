"use client";

import { useQuery } from "@tanstack/react-query";
import { isToday } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  HardHat,
  MapPin,
  Navigation,
  Play,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { parseSafeDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isAccepted } from "@/lib/work-order-rules";
import { technicianService } from "@/services/technician.service";
import type { TechnicianTask } from "@/types/api";

export function TechnicianOverviewClient() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Technician";

  // 1. Stat Card 1: Needs Response
  const {
    data: assignedData,
    isLoading: isAssignedLoading,
    isError: isAssignedError,
    refetch: refetchAssigned,
  } = useQuery({
    queryKey: ["technician", "stats", "assigned"],
    queryFn: () =>
      technicianService.fetchMyTasks({ status: "ASSIGNED", limit: 50 }),
    staleTime: 15_000,
  });

  const { needsResponseCount, isAcceptanceUnknown } = React.useMemo(() => {
    const items = assignedData?.data || [];
    let unknown = false;
    let count = 0;

    for (const item of items) {
      const accepted = isAccepted(item);
      if (accepted === null) {
        unknown = true;
        count++;
      } else if (accepted === false) {
        count++;
      }
    }

    return {
      needsResponseCount: count,
      isAcceptanceUnknown: unknown && count > 0,
    };
  }, [assignedData]);

  // 2. Stat Card 2: Visits Today & Next Visit
  const {
    data: scheduleData,
    isLoading: isScheduleLoading,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useQuery({
    queryKey: ["technician", "stats", "schedule-all"],
    queryFn: () =>
      technicianService.fetchMyTasks({
        limit: 100,
        sortBy: "visitStart",
        order: "asc",
      }),
    staleTime: 15_000,
  });

  const { visitsTodayCount, nextUpcomingVisit } = React.useMemo(() => {
    const items = scheduleData?.data || [];
    const now = new Date();
    let todayCount = 0;
    const upcomingCandidates: Array<{ task: TechnicianTask; date: Date }> = [];

    for (const item of items) {
      const dateVal = item.visitStart || item.scheduledDate;
      const d = parseSafeDate(dateVal);
      if (!d) continue;

      if (isToday(d)) {
        todayCount++;
      }

      if (
        ["SCHEDULED", "ARRIVED", "IN_PROGRESS"].includes(item.status) &&
        d.getTime() >= now.getTime() - 60 * 60 * 1000 // up to 1hr past
      ) {
        upcomingCandidates.push({ task: item, date: d });
      }
    }

    upcomingCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      visitsTodayCount: todayCount,
      nextUpcomingVisit: upcomingCandidates[0]?.task || null,
    };
  }, [scheduleData]);

  // 3. Stat Card 3: In Progress (IN_PROGRESS + ARRIVED)
  const {
    data: inProgressTotal,
    isLoading: isInProgressLoading,
    isError: isInProgressError,
    refetch: refetchInProgress,
  } = useQuery({
    queryKey: ["technician", "stats", "in-progress-count"],
    queryFn: async () => {
      const [inProgRes, arrivedRes] = await Promise.all([
        technicianService.fetchMyTasks({ status: "IN_PROGRESS", limit: 1 }),
        technicianService.fetchMyTasks({ status: "ARRIVED", limit: 1 }),
      ]);
      return (
        (inProgRes.pagination?.total || 0) + (arrivedRes.pagination?.total || 0)
      );
    },
    staleTime: 15_000,
  });

  // 4. Stat Card 4: Completed
  const {
    data: completedData,
    isLoading: isCompletedLoading,
    isError: isCompletedError,
    refetch: refetchCompleted,
  } = useQuery({
    queryKey: ["technician", "stats", "completed-count"],
    queryFn: () =>
      technicianService.fetchMyTasks({ status: "COMPLETED", limit: 1 }),
    staleTime: 15_000,
  });
  const completedTotal = completedData?.pagination?.total ?? 0;

  const nextVisitAddress =
    nextUpcomingVisit?.request?.address || "Address not provided";
  const mapsUrl = nextUpcomingVisit?.request?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextUpcomingVisit.request.address)}`
    : null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Your field operations overview, upcoming schedule, and active assignments."
        />

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link
            href="/technician/tasks"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5 flex-1 sm:flex-none text-xs font-semibold shadow-xs",
            )}
          >
            <Wrench className="size-3.5" />
            <span>View all tasks</span>
          </Link>
          <Link
            href="/technician/schedule"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 flex-1 sm:flex-none text-xs font-semibold shadow-xs",
            )}
          >
            <Calendar className="size-3.5" />
            <span>Open schedule</span>
          </Link>
          <Link
            href="/technician/performance"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 flex-1 sm:flex-none text-xs font-semibold shadow-xs",
            )}
          >
            <BarChart3 className="size-3.5" />
            <span>View performance</span>
          </Link>
        </div>
      </div>

      {/* 4 Independent Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Needs your response */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-amber-400 dark:hover:border-amber-600">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Needs Response
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isAssignedLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isAssignedError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Error</span>
                <button
                  type="button"
                  onClick={() => refetchAssigned()}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-heading text-foreground">
                  {needsResponseCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isAcceptanceUnknown
                    ? "Assigned jobs (awaiting acceptance or schedule)"
                    : "Unaccepted job assignments"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stat 2: Visits Today */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-brand-400 dark:hover:border-brand-600">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Visits Today
            </CardTitle>
            <div className="size-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isScheduleLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isScheduleError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Error</span>
                <button
                  type="button"
                  onClick={() => refetchSchedule()}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-heading text-foreground">
                  {visitsTodayCount}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Scheduled for today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stat 3: In Progress */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-purple-400 dark:hover:border-purple-600">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Play className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isInProgressLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isInProgressError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Error</span>
                <button
                  type="button"
                  onClick={() => refetchInProgress()}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-heading text-foreground">
                  {inProgressTotal ?? 0}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Active or on-site jobs
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stat 4: Completed */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-emerald-400 dark:hover:border-emerald-600">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isCompletedLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isCompletedError ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500 font-medium">Error</span>
                <button
                  type="button"
                  onClick={() => refetchCompleted()}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-heading text-foreground">
                  {completedTotal}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Total completed work orders
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Visit Spotlight Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-brand-600" />
            <span>Next Scheduled Visit</span>
          </h3>
          <Link
            href="/technician/schedule"
            className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
          >
            <span>Full Schedule</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {isScheduleLoading ? (
          <Skeleton className="h-44 w-full rounded-xl" />
        ) : isScheduleError ? (
          <Card className="border-border">
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              Unable to load next visit.
            </CardContent>
          </Card>
        ) : nextUpcomingVisit ? (
          <Card className="border-brand-500/30 bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    {nextUpcomingVisit.workOrderNumber ||
                      `#${nextUpcomingVisit.id.slice(0, 8)}`}
                  </span>
                  <StatusBadge status={nextUpcomingVisit.status} />
                  {nextUpcomingVisit.request?.category?.name && (
                    <Badge variant="secondary" className="text-[10px]">
                      {nextUpcomingVisit.request.category.name}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                  <Clock className="size-3.5" />
                  <span>
                    {safeFormatDateTime(
                      nextUpcomingVisit.visitStart ||
                        nextUpcomingVisit.scheduledDate,
                    )}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-3">
              <div>
                <h4 className="font-bold text-foreground text-base">
                  {nextUpcomingVisit.request?.title || "Field Service Visit"}
                </h4>
                {nextUpcomingVisit.request?.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {nextUpcomingVisit.request.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-border/60">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">
                    Customer: {nextUpcomingVisit.customer?.name || "Customer"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-foreground truncate">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{nextVisitAddress}</span>
                  </div>

                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "h-6 px-2 text-[11px] gap-1 shrink-0 text-brand-600 hover:text-brand-700",
                      )}
                    >
                      <Navigation className="size-3" />
                      <span>Maps</span>
                    </a>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-3 border-t border-border/60 bg-muted/10 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Arrive on time and confirm check-in on arrival
              </span>
              <Link
                href={`/technician/tasks/${nextUpcomingVisit.id}`}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-1.5 text-xs font-semibold shadow-xs",
                )}
              >
                <span>View job</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <EmptyState
            icon={HardHat}
            title="No upcoming visits"
            description="You currently have no service visits scheduled in the queue."
            action={
              <Link
                href="/technician/tasks"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "text-xs font-semibold",
                )}
              >
                View all tasks
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
