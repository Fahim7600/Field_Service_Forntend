"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Clock,
  Flame,
  HardHat,
  Play,
  RefreshCw,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { technicianService } from "@/services/technician.service";

export function TechnicianDashboardClient() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["technician-dashboard-tasks"],
    queryFn: () =>
      technicianService.fetchMyAssignedTasks({ page: 1, limit: 20 }),
    staleTime: 15000,
  });

  const tasks = data?.data || [];

  const inProgressTask = tasks.find(
    (t) => t.status === "IN_PROGRESS" || t.status === "ARRIVED",
  );
  const nextScheduledTask = tasks.find((t) => t.status === "SCHEDULED");
  const spotlightTask = inProgressTask || nextScheduledTask || tasks[0];

  const totalAssigned = tasks.length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "ARRIVED",
  ).length;
  const scheduledCount = tasks.filter((t) => t.status === "SCHEDULED").length;
  const pendingAcceptanceCount = tasks.filter(
    (t) => t.status === "ASSIGNED",
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load technician console
            </h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Unable to retrieve assigned tasks."}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground font-heading">
              Field Operations Console
            </h2>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-blue-500/30 text-blue-600 bg-blue-500/10"
            >
              ACTIVE SHIFT
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Manage your on-site visits, accept newly dispatched jobs, and submit
            service completion reports.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/technician/tasks"
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5 shadow-xs flex-1 sm:flex-none",
            )}
          >
            <Wrench className="size-3.5" />
            <span>All Tasks ({totalAssigned})</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 px-3 shrink-0"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span className="sr-only">Refresh tasks</span>
          </Button>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Tasks
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <HardHat className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalAssigned}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Active assigned queue
            </p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Play className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {inProgressCount}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              Currently on-site or active
            </p>
          </CardContent>
        </Card>

        {/* Scheduled Today */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled Visits
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {scheduledCount}
            </div>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              Confirmed time windows
            </p>
          </CardContent>
        </Card>

        {/* Pending Acceptance */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Acceptance
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {pendingAcceptanceCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Requires acceptance review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Spotlight: Active or Next Job Banner */}
      {spotlightTask ? (
        <Card className="border-primary/40 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Flame className="size-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                    {spotlightTask.status === "IN_PROGRESS" ||
                    spotlightTask.status === "ARRIVED"
                      ? "Active Job in Progress"
                      : "Next Upcoming Assignment"}
                  </span>
                  <CardTitle className="text-base font-bold text-foreground">
                    {spotlightTask.request?.title ||
                      `Work Order #${spotlightTask.id.slice(0, 8)}`}
                  </CardTitle>
                </div>
              </div>
              <StatusBadge status={spotlightTask.status} />
            </div>
          </CardHeader>

          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold block">
                Customer & Location
              </span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground" />
                <span>{spotlightTask.customer?.name || "Customer"}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold block">
                Category & Priority
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {spotlightTask.request?.category?.name || "General Service"}
                </Badge>
                {spotlightTask.request?.priority && (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-mono"
                  >
                    {spotlightTask.request.priority}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground uppercase text-[10px] font-semibold block">
                Scheduled Window
              </span>
              <p className="text-foreground flex items-center gap-1.5">
                <CalendarCheck className="size-3.5 text-muted-foreground" />
                <span>
                  {spotlightTask.visitStart
                    ? formatSafeDateTime(spotlightTask.visitStart)
                    : "Not scheduled yet"}
                </span>
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-3 pb-4 border-t border-border/60 bg-panel/40 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground font-mono">
              WO #{spotlightTask.id.slice(0, 8)}
            </span>
            <Link
              href={`/technician/tasks/${spotlightTask.id}`}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "gap-1.5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground",
              )}
            >
              <span>Execute Task</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <EmptyState
          icon={HardHat}
          title="No Active Jobs Right Now"
          description="You currently have no tasks in progress. Check back when dispatch assigns new service requests."
        />
      )}

      {/* Assigned Tasks List */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/80 bg-panel/50 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="size-4 text-primary" />
              <span>Assigned Job Queue ({tasks.length})</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Work orders ready for execution, customer check-in, and
              completion.
            </CardDescription>
          </div>
          <Link
            href="/technician/tasks"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="size-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No tasks currently in your queue.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        {task.request?.title ||
                          `Work Order #${task.id.slice(0, 8)}`}
                      </span>
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>Customer: {task.customer?.name || "Customer"}</span>
                      <span>
                        Category: {task.request?.category?.name || "Service"}
                      </span>
                      {task.visitStart && (
                        <span>
                          Scheduled: {formatSafeDateTime(task.visitStart)}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/technician/tasks/${task.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1 shrink-0",
                    )}
                  >
                    <span>View Task</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
