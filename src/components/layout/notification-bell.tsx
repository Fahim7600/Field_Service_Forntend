"use client";

import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationPreview,
  useUnreadCount,
} from "@/hooks/use-notifications";
import { ROLE_HOME } from "@/lib/auth-routes";
import { extractArray } from "@/lib/extract-data";
import { formatRelative } from "@/lib/format";
import {
  getNotificationHref,
  getNotificationVisual,
} from "@/lib/notification-links";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";
import type { Notification } from "@/types/notification";

const TONE_CLASSES = {
  info: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  danger:
    "bg-destructive/10 text-destructive dark:text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export interface NotificationBellProps {
  role: Role;
}

export function NotificationBell({ role }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const {
    data: previewData,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    refetch: refetchPreview,
  } = useNotificationPreview();

  const {
    count: unreadCount,
    formatted: formattedCount,
    hasUnread,
  } = useUnreadCount();

  const markNotificationRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const notifications =
    previewData?.items ?? extractArray<Notification>(previewData);

  // New-notification toast tracking across polling cycles
  const seenIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialSessionRef = React.useRef(true);

  React.useEffect(() => {
    const currentItems =
      previewData?.items ?? extractArray<Notification>(previewData);
    if (!currentItems || currentItems.length === 0) return;

    if (isInitialSessionRef.current) {
      for (const item of currentItems) {
        seenIdsRef.current.add(item.id);
      }
      isInitialSessionRef.current = false;
      return;
    }

    const newUnreadItems = currentItems.filter(
      (item) => !item.isRead && !seenIdsRef.current.has(item.id),
    );

    for (const item of currentItems) {
      seenIdsRef.current.add(item.id);
    }

    if (newUnreadItems.length === 1) {
      toast.info(newUnreadItems[0].title, {
        description: newUnreadItems[0].message,
      });
    } else if (newUnreadItems.length > 1) {
      toast.info(`You have ${newUnreadItems.length} new notifications`, {
        description: newUnreadItems[0].title,
      });
    }
  }, [previewData]);

  const handleItemClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationRead.mutate({ id: notification.id, isRead: false });
    }
    setOpen(false);

    const href = getNotificationHref(notification, role);
    if (href) {
      router.push(href);
    }
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasUnread || markAllRead.isPending) return;
    markAllRead.mutate();
  };

  const allNotificationsHref = `${ROLE_HOME[role] || "/customer"}/notifications`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-full text-charcoal-700 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
            aria-label={
              hasUnread
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          >
            <Bell className="size-4.5" />
            {hasUnread && (
              <span className="absolute 0 top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white shadow-xs">
                {formattedCount}
              </span>
            )}
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-88 max-w-[22rem] p-0 overflow-hidden rounded-2xl shadow-lg border border-border bg-popover"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/80 bg-card">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground tracking-tight">
              Notifications
            </span>
            {hasUnread && (
              <span className="rounded-full bg-brand-500/10 px-1.5 py-0.2 text-[10px] font-bold text-brand-600 dark:text-brand-400">
                {formattedCount} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={!hasUnread || markAllRead.isPending}
            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40 disabled:no-underline transition-opacity"
          >
            {markAllRead.isPending ? "Marking..." : "Mark all read"}
          </button>
        </div>

        {/* Notifications List Body */}
        <div className="max-h-84 overflow-y-auto divide-y divide-border/50">
          {isPreviewLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isPreviewError ? (
            <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
              <p>Unable to load notifications.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchPreview()}
                className="h-7 text-xs"
              >
                <RefreshCw className="size-3 mr-1" />
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs">
              <CheckCircle2 className="size-7 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-foreground">You are all caught up</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No notifications right now.
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const { icon: VisualIcon, tone } = getNotificationVisual(
                item.type,
              );
              const isClickable = Boolean(getNotificationHref(item, role));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "w-full text-left p-3.5 transition-colors flex items-start gap-3 relative focus:outline-none focus:bg-muted/60",
                    !item.isRead
                      ? "bg-brand-50/40 dark:bg-brand-950/20 hover:bg-brand-50/70 dark:hover:bg-brand-950/30"
                      : "hover:bg-muted/40",
                    isClickable ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5",
                      TONE_CLASSES[tone],
                    )}
                  >
                    <VisualIcon className="size-4" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs truncate",
                          !item.isRead
                            ? "font-bold text-foreground"
                            : "font-medium text-foreground/85",
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <span
                      className="size-2 rounded-full bg-brand-600 shrink-0 mt-1.5"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer Link */}
        <Link
          href={allNotificationsHref}
          onClick={() => setOpen(false)}
          className="block py-2.5 text-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-muted/50 transition-colors border-t border-border/80 bg-card"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
