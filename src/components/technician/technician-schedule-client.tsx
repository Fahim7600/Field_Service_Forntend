"use client";

import { useQuery } from "@tanstack/react-query";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  startOfDay,
} from "date-fns";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { QueryError } from "@/components/shared/query-error";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { parseSafeDate, safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { technicianService } from "@/services/technician.service";
import type { TechnicianTask } from "@/types/api";

type RangeOption = "7" | "30" | "all";

export function TechnicianScheduleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentRange: RangeOption =
    (searchParams.get("range") as RangeOption) || "7";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["technician", "schedule", "all"],
    queryFn: () =>
      technicianService.fetchMyTasks({
        limit: 100,
        sortBy: "visitStart",
        order: "asc",
      }),
  });

  const rawTasks = data?.data || [];

  const handleRangeChange = (newRange: RangeOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRange === "7") {
      params.delete("range");
    } else {
      params.set("range", newRange);
    }
    router.push(`/technician/schedule?${params.toString()}`);
  };

  // Filter tasks with scheduled dates
  const now = new Date();
  const todayStart = startOfDay(now);

  const { validTasks, missingDateCount, nextUpcomingTaskId } =
    React.useMemo(() => {
      let missingCount = 0;
      const valid: Array<{ task: TechnicianTask; date: Date }> = [];

      for (const t of rawTasks) {
        const dateVal = t.visitStart || t.scheduledDate;
        const d = parseSafeDate(dateVal);
        if (!d) {
          if (["SCHEDULED", "ARRIVED", "IN_PROGRESS"].includes(t.status)) {
            missingCount++;
          }
          continue;
        }

        // Apply range filter
        if (currentRange === "7") {
          const maxDate = addDays(todayStart, 7);
          if (isBefore(d, todayStart) || isAfter(d, maxDate)) continue;
        } else if (currentRange === "30") {
          const maxDate = addDays(todayStart, 30);
          if (isBefore(d, todayStart) || isAfter(d, maxDate)) continue;
        }

        valid.push({ task: t, date: d });
      }

      // Sort ascending by visit date
      valid.sort((a, b) => a.date.getTime() - b.date.getTime());

      // Identify the very next upcoming visit
      const nextUpcoming = valid.find(
        (item) =>
          item.date.getTime() >= now.getTime() &&
          ["SCHEDULED", "ARRIVED", "IN_PROGRESS"].includes(item.task.status),
      );

      return {
        validTasks: valid,
        missingDateCount: missingCount,
        nextUpcomingTaskId: nextUpcoming?.task.id,
      };
    }, [rawTasks, currentRange, todayStart, now]);

  // Group by calendar day key "yyyy-MM-dd"
  const groupedByDay = React.useMemo(() => {
    const map = new Map<string, { date: Date; items: TechnicianTask[] }>();

    for (const { task, date } of validTasks) {
      const dayKey = format(date, "yyyy-MM-dd");
      if (!map.has(dayKey)) {
        map.set(dayKey, { date, items: [] });
      }
      map.get(dayKey)?.items.push(task);
    }

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      date: value.date,
      items: value.items,
    }));
  }, [validTasks]);

  const formatDayHeading = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, dd MMM yyyy");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Schedule"
        description="Your assigned service visits and daily agenda."
      />

      {/* Range Selector Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => handleRangeChange("7")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              currentRange === "7"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Next 7 Days
          </button>
          <button
            type="button"
            onClick={() => handleRangeChange("30")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              currentRange === "30"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Next 30 Days
          </button>
          <button
            type="button"
            onClick={() => handleRangeChange("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              currentRange === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            All Visits
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          {validTasks.length} visit{validTasks.length === 1 ? "" : "s"}{" "}
          scheduled
        </div>
      </div>

      {/* Missing date warning note */}
      {missingDateCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/60 text-xs text-muted-foreground">
          <Clock className="size-3.5 text-muted-foreground shrink-0" />
          <span>
            {missingDateCount} active assignment
            {missingDateCount === 1 ? "" : "s"} do not have scheduled visit
            times yet (awaiting dispatcher).
          </span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2].map((group) => (
            <div key={group} className="space-y-3">
              <Skeleton className="h-6 w-36" />
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load schedule"
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && groupedByDay.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No scheduled visits"
          description={
            currentRange === "7"
              ? "You have no service visits scheduled in the next 7 days."
              : currentRange === "30"
                ? "You have no service visits scheduled in the next 30 days."
                : "You have no service visits scheduled."
          }
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

      {/* Grouped Agenda List */}
      {!isLoading && !isError && groupedByDay.length > 0 && (
        <div className="space-y-8">
          {groupedByDay.map(({ key, date, items }) => (
            <section key={key} className="space-y-3">
              {/* Day Header */}
              <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
                <Calendar className="size-4 text-brand-600 dark:text-brand-400" />
                <h3 className="font-bold text-sm text-foreground">
                  {formatDayHeading(date)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({items.length} job{items.length === 1 ? "" : "s"})
                </span>
                {isToday(date) && (
                  <Badge
                    variant="outline"
                    className="ml-auto bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 text-[10px] font-bold"
                  >
                    Today
                  </Badge>
                )}
              </div>

              {/* Tasks for the day */}
              <div className="space-y-3">
                {items.map((task) => {
                  const isNextUp = task.id === nextUpcomingTaskId;
                  const timeStart = task.visitStart
                    ? safeFormatDate(task.visitStart, "hh:mm a")
                    : "TBD";
                  const timeEnd = task.visitEnd
                    ? safeFormatDate(task.visitEnd, "hh:mm a")
                    : "";

                  return (
                    <Card
                      key={task.id}
                      className={cn(
                        "transition-all duration-150 border bg-card hover:border-brand-400 dark:hover:border-brand-600 shadow-xs",
                        isNextUp &&
                          "ring-2 ring-brand-500/30 border-brand-500 bg-brand-50/20 dark:bg-brand-950/10",
                      )}
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2.5 min-w-0 flex-1">
                          {/* Row 1: Badges & Numbers */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-muted-foreground">
                              {task.workOrderNumber ||
                                `#${task.id.slice(0, 8)}`}
                            </span>
                            <StatusBadge status={task.status} />

                            {isNextUp && (
                              <Badge
                                variant="default"
                                className="bg-brand-600 text-white text-[10px] font-bold gap-1"
                              >
                                <Sparkles className="size-3" />
                                Next Up
                              </Badge>
                            )}

                            {task.request?.category?.name && (
                              <Badge
                                variant="secondary"
                                className="text-[11px] font-medium"
                              >
                                {task.request.category.name}
                              </Badge>
                            )}
                          </div>

                          {/* Row 2: Title */}
                          <h4 className="font-bold text-foreground text-sm sm:text-base leading-snug">
                            {task.request?.title || "Field Service Visit"}
                          </h4>

                          {/* Row 3: Meta details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                            {/* Time Window */}
                            <div className="flex items-center gap-1.5 text-foreground font-semibold">
                              <Clock className="size-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                              <span>
                                {timeStart}
                                {timeEnd ? ` – ${timeEnd}` : ""}
                              </span>
                            </div>

                            {/* Customer */}
                            {task.customer?.name && (
                              <div className="flex items-center gap-1.5 truncate">
                                <User className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  {task.customer.name}
                                </span>
                              </div>
                            )}

                            {/* Address */}
                            {task.request?.address && (
                              <div className="flex items-center gap-1.5 truncate sm:col-span-1">
                                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="truncate">
                                  {task.request.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Link */}
                        <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
                          <Link
                            href={`/technician/tasks/${task.id}`}
                            className={cn(
                              buttonVariants({
                                variant: isNextUp ? "default" : "outline",
                                size: "sm",
                              }),
                              "w-full sm:w-auto justify-center gap-1.5 text-xs font-semibold",
                            )}
                          >
                            <span>View job</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
