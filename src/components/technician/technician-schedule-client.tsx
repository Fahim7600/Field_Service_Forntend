"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Clock, MapPin, User } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { extractArray } from "@/lib/extract-data";
import { formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { technicianService } from "@/services/technician.service";
import type { WorkOrderSummary } from "@/types/api";

export function TechnicianScheduleClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["technician-schedule-tasks"],
    queryFn: () => technicianService.fetchMyAssignedTasks({ limit: 50 }),
  });

  const tasks = extractArray<WorkOrderSummary>(data);

  // Filter scheduled or active tasks and sort by visitStart or createdAt
  const scheduledTasks = tasks
    .filter(
      (t) =>
        t.status === "SCHEDULED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "ARRIVED",
    )
    .sort((a, b) => {
      const timeA = new Date(a.visitStart || a.createdAt || 0).getTime();
      const timeB = new Date(b.visitStart || b.createdAt || 0).getTime();
      return timeA - timeB;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Schedule"
        description="Your upcoming service assignments and dispatch schedule."
      />

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders
              key={i}
              className="h-28 w-full rounded-2xl"
            />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={Calendar}
          title="Error loading schedule"
          description="Could not load your service assignments. Please try again."
        />
      ) : scheduledTasks.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No scheduled visits"
          description="You currently have no upcoming scheduled service visits assigned."
        />
      ) : (
        <div className="space-y-4">
          {scheduledTasks.map((task) => (
            <Card
              key={task.id}
              className={cn(
                "hover:shadow-md transition-shadow border-l-4",
                task.status === "IN_PROGRESS"
                  ? "border-l-amber-500 bg-amber-500/5"
                  : "border-l-brand-500",
              )}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted-foreground">
                      {task.request?.requestNumber || `#${task.id.slice(0, 8)}`}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="font-bold text-charcoal-900 dark:text-charcoal-100 text-lg">
                    {task.request?.title || "Field Service Task"}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-charcoal-800 dark:text-charcoal-200">
                      <Clock className="size-3.5 text-brand-500" />
                      {task.visitStart
                        ? formatSafeDateTime(task.visitStart)
                        : "Pending dispatch schedule"}
                    </span>

                    {task.request?.category?.name && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {task.request.category.name}
                      </span>
                    )}

                    {task.customer?.name && (
                      <span className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        {task.customer.name}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/technician/tasks/${task.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "shrink-0",
                  )}
                >
                  View Details
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
