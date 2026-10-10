"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Star,
  Timer,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { StarRating } from "@/components/shared/star-rating";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { extractArray } from "@/lib/extract-data";
import { safeFormatDate } from "@/lib/format";
import { formatDuration } from "@/lib/stats-utils";
import { cn } from "@/lib/utils";
import { adminLogsService } from "@/services/admin-logs.service";
import { adminStatsService } from "@/services/admin-stats.service";
import { adminUsersService } from "@/services/admin-users.service";
import type { AdminUser, FeedbackItem } from "@/types/admin";

interface TechnicianAnalyticsClientProps {
  id: string;
}

function getInitials(name: string): string {
  if (!name) return "TC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function TechnicianAnalyticsClient({
  id,
}: TechnicianAnalyticsClientProps) {
  // 1. Fetch technician user info
  const { data: usersData } = useQuery({
    queryKey: ["admin-technician-user", id],
    queryFn: () =>
      adminUsersService.fetchAdminUsers({
        role: "TECHNICIAN",
        search: id,
        limit: 10,
      }),
    staleTime: 60000,
  });

  const matchingUsers = extractArray<AdminUser>(usersData);
  const technicianUser =
    matchingUsers.find((u) => u.id === id) || matchingUsers[0] || null;

  // 2. Fetch technician analytics metrics
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isAnalyticsError,
    error: analyticsError,
    refetch: refetchAnalytics,
    isFetching: isFetchingAnalytics,
  } = useQuery({
    queryKey: ["admin-technician-analytics", id],
    queryFn: () => adminStatsService.fetchTechnicianAnalytics(id),
    staleTime: 30000,
    retry: 1,
  });

  // 3. Fetch recent customer feedback for this technician
  const {
    data: feedbackData,
    isLoading: isLoadingFeedback,
    isError: isFeedbackError,
    refetch: refetchFeedback,
  } = useQuery({
    queryKey: ["admin-technician-feedback", id],
    queryFn: () =>
      adminLogsService.fetchFeedback({
        technicianId: id,
        limit: 5,
      }),
    staleTime: 30000,
  });

  const feedbackList = extractArray<FeedbackItem>(feedbackData);

  // Check 404 condition
  const is404 =
    !isLoadingAnalytics &&
    isAnalyticsError &&
    ((analyticsError as { status?: number })?.status === 404 ||
      (analyticsError instanceof Error &&
        analyticsError.message.includes("404")));

  if (is404) {
    return (
      <div className="py-12 max-w-lg mx-auto">
        <EmptyState
          icon={AlertCircle}
          title="Technician Not Found"
          description={`No technician record found with ID "${id}". They may have been deleted or the ID is incorrect.`}
          action={
            <Link
              href="/admin/technicians"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              <span>Back to Technicians</span>
            </Link>
          }
        />
      </div>
    );
  }

  const displayName =
    analytics?.technician?.name ||
    technicianUser?.name ||
    `Technician #${id.slice(0, 8)}`;
  const displayEmail = technicianUser?.email;

  // onTimeRate is ALREADY a percentage (e.g. 92.5) per shape 2
  const rawOnTime = analytics?.onTimeRate;
  const onTimePct =
    typeof rawOnTime === "number" && Number.isFinite(rawOnTime)
      ? Math.min(100, Math.max(0, Math.round(rawOnTime * 10) / 10))
      : null;

  const durationFormatted = formatDuration(analytics?.averageJobMinutes);

  const jobsDoneCount = analytics?.jobsDone ?? 0;
  const ratingCount = analytics?.ratingCount ?? null;
  const measuredJobs = analytics?.measuredJobs ?? null;

  return (
    <div className="space-y-6">
      {/* Back Link and Header */}
      <div className="space-y-4">
        <Link
          href="/admin/technicians"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>All Technicians</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-4 sm:p-6 rounded-xl shadow-xs">
          <div className="flex items-center gap-4">
            <Avatar className="size-12 rounded-full border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-base font-heading">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-foreground font-heading">
                  {displayName}
                </h1>
                {technicianUser && (
                  <StatusBadge status={technicianUser.status} />
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                {displayEmail && (
                  <span className="font-mono">{displayEmail}</span>
                )}
                {technicianUser?.phone && <span>• {technicianUser.phone}</span>}
                {technicianUser?.createdAt && (
                  <span>
                    • Joined {safeFormatDate(technicianUser.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchAnalytics();
              refetchFeedback();
            }}
            disabled={isFetchingAnalytics}
            className="gap-1.5 shadow-2xs"
          >
            <RefreshCw
              className={cn("size-3.5", isFetchingAnalytics && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      {isAnalyticsError ? (
        <Card className="border-border shadow-xs">
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="size-6 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Failed to load analytics metrics
              </h3>
              <p className="text-xs text-muted-foreground">
                Could not retrieve performance figures for this technician.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAnalytics()}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              <span>Retry</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Jobs Done */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Jobs Done
              </CardTitle>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {isLoadingAnalytics ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
                    {jobsDoneCount.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Finished assignments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Average Rating */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Rating
              </CardTitle>
              <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Star className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {isLoadingAnalytics ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ) : ratingCount &&
                ratingCount > 0 &&
                typeof analytics?.averageRating === "number" ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-heading text-foreground tabular-nums">
                      {analytics.averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 5.0</span>
                  </div>
                  <div className="mt-1">
                    <StarRating
                      value={Math.round(analytics.averageRating)}
                      readOnly
                      size="sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Based on {ratingCount}{" "}
                    {ratingCount === 1 ? "rating" : "ratings"}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">
                    No ratings yet
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Awaiting customer reviews
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: On-Time Rate */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                On-Time Rate
              </CardTitle>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Clock className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {isLoadingAnalytics ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : onTimePct !== null ? (
                <div>
                  <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
                    {onTimePct}%
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, onTimePct))}%`,
                      }}
                    />
                  </div>
                  {measuredJobs ? (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Based on {measuredJobs} measured jobs
                    </p>
                  ) : null}
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-heading text-muted-foreground tabular-nums">
                    —
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Not reported
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Average Job Duration */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Average Job Time
              </CardTitle>
              <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Timer className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {isLoadingAnalytics ? (
                <div className="space-y-2 py-1">
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ) : durationFormatted !== "-" ? (
                <div>
                  <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
                    {durationFormatted}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Per completed task
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold font-heading text-muted-foreground tabular-nums">
                    —
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Not reported
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Feedback Section */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/50 bg-panel/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground font-heading">
                <MessageSquare className="size-4 text-primary" />
                <span>Recent Customer Feedback</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Latest customer ratings and service reviews for this technician
              </CardDescription>
            </div>
            <Link
              href={`/admin/feedback?technicianId=${id}`}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs gap-1.5 h-8",
              )}
            >
              <span>View all feedback</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoadingFeedback ? (
            <div className="space-y-3">
              {["fb-s1", "fb-s2", "fb-s3"].map((key) => (
                <div
                  key={key}
                  className="p-3 border border-border/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : isFeedbackError ? (
            <div className="text-center py-6 space-y-2">
              <p className="text-xs text-destructive">
                Failed to load feedback records.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchFeedback()}
              >
                Retry
              </Button>
            </div>
          ) : feedbackList.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No feedback yet"
              description="Customer reviews for completed service visits will appear here."
              className="border-0 shadow-none py-6"
            />
          ) : (
            <div className="space-y-3">
              {feedbackList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-border bg-panel/20 hover:bg-panel/40 transition-colors space-y-2"
                >
                  <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StarRating value={item.rating} readOnly size="sm" />
                      <span className="text-xs font-semibold text-foreground">
                        {item.rating} / 5
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {safeFormatDate(item.createdAt)}
                    </span>
                  </div>

                  {item.comment ? (
                    <p className="text-xs text-foreground/90 leading-relaxed italic">
                      "{item.comment}"
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No written comment provided.
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>
                      Customer:{" "}
                      <span className="font-medium text-foreground">
                        {item.customer?.name || "Customer"}
                      </span>
                    </span>
                    {item.workOrder?.id && (
                      <span className="font-mono">
                        WO: #{item.workOrder.id.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
