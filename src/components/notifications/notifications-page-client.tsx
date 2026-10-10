"use client";

import {
  Check,
  CheckCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type * as React from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationsList,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { extractArray } from "@/lib/extract-data";
import { formatRelative, safeFormatDateTime } from "@/lib/format";
import {
  getNotificationHref,
  getNotificationVisual,
} from "@/lib/notification-links";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";
import type { Notification } from "@/types/notification";

const TONE_STYLES = {
  info: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger:
    "bg-destructive/10 text-destructive dark:text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export interface NotificationsPageClientProps {
  userRole: Role;
}

export function NotificationsPageClient({
  userRole,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const { filters, updateFilters } = useUrlFilters({
    page: 1,
    limit: 10,
    status: "ALL",
  });

  const activeFilter = (filters.status as string) || "ALL";

  const isReadParam =
    activeFilter === "UNREAD"
      ? "false"
      : activeFilter === "READ"
        ? "true"
        : undefined;

  const { data, isLoading, isError, error, refetch } = useNotificationsList({
    page: filters.page ? Number(filters.page) : 1,
    limit: 10,
    isRead: isReadParam,
  });

  const { hasUnread } = useUnreadCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllRead();

  const notifications = data?.items ?? extractArray<Notification>(data);
  const pagination = data?.meta ?? data?.pagination;

  const handleCardClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate({ id: notification.id, isRead: false });
    }
    const href = getNotificationHref(notification, userRole);
    if (href) {
      router.push(href);
    }
  };

  const handleMarkSingleRead = (
    e: React.MouseEvent,
    notification: Notification,
  ) => {
    e.stopPropagation();
    markReadMutation.mutate({ id: notification.id, isRead: false });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        description="Stay updated on service requests, job assignments, scheduling, and billing updates."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={!hasUnread || markAllMutation.isPending}
            className="text-xs font-semibold gap-1.5"
          >
            {markAllMutation.isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1" />
                <span>Marking...</span>
              </>
            ) : (
              <>
                <CheckCheck className="size-3.5" />
                <span>Mark all as read</span>
              </>
            )}
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        {[
          { label: "All", value: "ALL" },
          { label: "Unread", value: "UNREAD" },
          { label: "Read", value: "READ" },
        ].map((tab) => {
          const isActive = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => updateFilters({ status: tab.value })}
              className={cn(
                "rounded-full px-3.5 py-1 text-xs font-semibold transition-colors",
                isActive
                  ? "bg-brand-600 text-white shadow-2xs"
                  : "bg-muted text-charcoal-600 hover:bg-muted/80",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border border-border bg-card p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className="border border-border bg-card p-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Unable to load notifications (
              {error instanceof Error ? error.message : "Network error"}).
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Retry
            </Button>
          </Card>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={
              activeFilter === "UNREAD"
                ? "No unread notifications"
                : "No notifications yet"
            }
            description={
              activeFilter === "UNREAD"
                ? "You have read all your notifications."
                : "You don't have any notifications right now."
            }
          />
        ) : (
          notifications.map((item) => {
            const { icon: ToneIcon, tone } = getNotificationVisual(item.type);
            const targetHref = getNotificationHref(item, userRole);
            const isClickable = Boolean(targetHref);

            return (
              <Card
                key={item.id}
                onClick={() => isClickable && handleCardClick(item)}
                className={cn(
                  "border transition-all duration-150 p-4 sm:p-5 rounded-2xl shadow-xs",
                  !item.isRead
                    ? "border-brand-500/30 bg-brand-50/30 dark:bg-brand-950/15"
                    : "border-border bg-card hover:border-border/90",
                  isClickable && "cursor-pointer hover:shadow-sm",
                )}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Tone Icon Badge */}
                  <div
                    className={cn(
                      "size-9 sm:size-10 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
                      TONE_STYLES[tone],
                    )}
                  >
                    <ToneIcon className="size-4.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "text-xs sm:text-sm tracking-tight text-foreground",
                            !item.isRead ? "font-bold" : "font-semibold",
                          )}
                        >
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <Badge className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                        {safeFormatDateTime(item.createdAt)} (
                        {formatRelative(item.createdAt)})
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {item.message}
                    </p>

                    {/* Actions and Link indicator */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkSingleRead(e, item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            <Check className="size-3" />
                            <span>Mark as read</span>
                          </button>
                        )}
                      </div>

                      {targetHref && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                          <span>Open details</span>
                          <ExternalLink className="size-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-2">
          <PaginationControls
            meta={pagination}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}
    </div>
  );
}
