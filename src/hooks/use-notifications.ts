"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { ApiError } from "@/lib/api-client";
import { messages, notify } from "@/lib/notify";
import { notificationsService } from "@/services/notifications.service";
import { useAuthStore } from "@/stores/auth-store";
import type { PaginatedResponse } from "@/types/api";
import type {
  MarkAllReadResponse,
  MarkReadResponse,
  Notification,
  NotificationListParams,
} from "@/types/notification";

/**
 * Tracks whether the document tab is currently visible.
 */
function useDocumentVisibility(): boolean {
  const [isVisible, setIsVisible] = React.useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.visibilityState === "visible";
    }
    return true;
  });

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}

function is4xxError(err: unknown): boolean {
  if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
    return true;
  }
  if (
    axios.isAxiosError(err) &&
    err.response?.status &&
    err.response.status >= 400 &&
    err.response.status < 500
  ) {
    return true;
  }
  return false;
}

/**
 * Fetches the latest 5 notifications for the topbar bell preview dropdown.
 * Polls every 30s only while the tab is visible. Refetches on window focus.
 */
export function useNotificationPreview() {
  const isVisible = useDocumentVisibility();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", "preview"],
    queryFn: () =>
      notificationsService.fetchNotifications({ page: 1, limit: 5 }),
    enabled: isAuthenticated,
    refetchInterval: isVisible ? 30_000 : false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    meta: {
      skipToast: true,
    },
    retry: (failureCount, err) => {
      if (is4xxError(err)) return false;
      return failureCount < 2;
    },
  });
}

/**
 * Fetches total unread count: reads extra.unreadCount from the preview query response first.
 * Only if extra is missing does it fall back to the separate isRead=false query.
 */
export function useUnreadCount() {
  const isVisible = useDocumentVisibility();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  const previewQuery = useNotificationPreview();

  const extra = previewQuery.data?.extra as
    | { unreadCount?: number }
    | undefined;
  const hasExtra = typeof extra?.unreadCount === "number";

  const fallbackQuery = useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      notificationsService.fetchNotifications({
        page: 1,
        limit: 1,
        isRead: "false",
      }),
    enabled: isAuthenticated && !hasExtra && !previewQuery.isLoading,
    refetchInterval: isVisible ? 30_000 : false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    meta: {
      skipToast: true,
    },
    retry: (failureCount, err) => {
      if (is4xxError(err)) return false;
      return failureCount < 2;
    },
  });

  const rawCount = hasExtra
    ? (extra?.unreadCount ?? 0)
    : (fallbackQuery.data?.meta?.total ??
      fallbackQuery.data?.pagination?.total ??
      0);

  const count = Math.max(0, rawCount);
  const formatted = count > 9 ? "9+" : String(count);

  return {
    count,
    formatted,
    hasUnread: count > 0,
    isLoading: hasExtra ? previewQuery.isLoading : fallbackQuery.isLoading,
    isError: hasExtra ? previewQuery.isError : fallbackQuery.isError,
    refetch: () => {
      previewQuery.refetch();
      if (!hasExtra) fallbackQuery.refetch();
    },
  };
}

/**
 * Fetches the full notifications list with filters and pagination.
 */
export function useNotificationsList(params: NotificationListParams) {
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  return useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", "list", params],
    queryFn: () => notificationsService.fetchNotifications(params),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

/**
 * Optimistically marks a single notification as read.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<
    MarkReadResponse,
    unknown,
    { id: string; isRead?: boolean },
    {
      previousPreview?: PaginatedResponse<Notification>;
      previousUnread?: PaginatedResponse<Notification>;
    }
  >({
    mutationFn: async ({ id, isRead }) => {
      if (isRead) {
        return { id, isRead: true };
      }
      return notificationsService.markNotificationRead(id);
    },
    onMutate: async ({ id, isRead }) => {
      if (isRead) return {};

      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousPreview = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "preview"]);
      const previousUnread = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "unread-count"]);

      // 1. Update Preview cache & decrement extra.unreadCount if present
      if (previousPreview) {
        const prevExtra = previousPreview.extra as
          | { unreadCount?: number }
          | undefined;
        const newUnreadCount =
          typeof prevExtra?.unreadCount === "number"
            ? Math.max(0, prevExtra.unreadCount - 1)
            : undefined;

        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "preview"],
          {
            ...previousPreview,
            items: (previousPreview.items ?? previousPreview.data ?? []).map(
              (n) => (n.id === id ? { ...n, isRead: true } : n),
            ),
            data: (previousPreview.data ?? previousPreview.items ?? []).map(
              (n) => (n.id === id ? { ...n, isRead: true } : n),
            ),
            extra:
              newUnreadCount !== undefined
                ? { ...prevExtra, unreadCount: newUnreadCount }
                : previousPreview.extra,
          },
        );
      }

      // 2. Decrement Unread count cache (fallback query)
      if (previousUnread) {
        const prevTotal =
          previousUnread.meta?.total ?? previousUnread.pagination?.total ?? 0;
        const newTotal = Math.max(0, prevTotal - 1);
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "unread-count"],
          {
            ...previousUnread,
            pagination: {
              ...previousUnread.pagination,
              total: newTotal,
            },
            meta: {
              ...previousUnread.meta,
              total: newTotal,
            },
          },
        );
      }

      // 3. Update any active list queries
      queryClient.setQueriesData<PaginatedResponse<Notification>>(
        { queryKey: ["notifications", "list"] },
        (old) => {
          if (!old) return old;
          const updateItem = (n: Notification) =>
            n.id === id ? { ...n, isRead: true } : n;
          return {
            ...old,
            items: (old.items ?? old.data ?? []).map(updateItem),
            data: (old.data ?? old.items ?? []).map(updateItem),
          };
        },
      );

      return { previousPreview, previousUnread };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPreview) {
        queryClient.setQueryData(
          ["notifications", "preview"],
          context.previousPreview,
        );
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnread,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Optimistically marks all notifications as read for current user.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation<
    MarkAllReadResponse,
    unknown,
    void,
    {
      previousPreview?: PaginatedResponse<Notification>;
      previousUnread?: PaginatedResponse<Notification>;
    }
  >({
    mutationFn: () => notificationsService.markAllNotificationsRead(),
    onSuccess: () => {
      notify.success(
        messages.notifications.allRead.title,
        messages.notifications.allRead.description,
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousPreview = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "preview"]);
      const previousUnread = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "unread-count"]);

      // 1. Update Preview cache & reset extra.unreadCount to 0
      if (previousPreview) {
        const prevExtra = previousPreview.extra as
          | { unreadCount?: number }
          | undefined;

        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "preview"],
          {
            ...previousPreview,
            items: (previousPreview.items ?? previousPreview.data ?? []).map(
              (n) => ({ ...n, isRead: true }),
            ),
            data: (previousPreview.data ?? previousPreview.items ?? []).map(
              (n) => ({ ...n, isRead: true }),
            ),
            extra:
              prevExtra !== undefined
                ? { ...prevExtra, unreadCount: 0 }
                : previousPreview.extra,
          },
        );
      }

      // 2. Clear unread count cache (fallback query)
      if (previousUnread) {
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "unread-count"],
          {
            ...previousUnread,
            pagination: {
              ...previousUnread.pagination,
              total: 0,
            },
            meta: {
              ...previousUnread.meta,
              total: 0,
            },
          },
        );
      }

      // 3. Update all list queries
      queryClient.setQueriesData<PaginatedResponse<Notification>>(
        { queryKey: ["notifications", "list"] },
        (old) => {
          if (!old) return old;
          const markAll = (n: Notification) => ({ ...n, isRead: true });
          return {
            ...old,
            items: (old.items ?? old.data ?? []).map(markAll),
            data: (old.data ?? old.items ?? []).map(markAll),
          };
        },
      );

      return { previousPreview, previousUnread };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPreview) {
        queryClient.setQueryData(
          ["notifications", "preview"],
          context.previousPreview,
        );
      }
      if (context?.previousUnread) {
        queryClient.setQueryData(
          ["notifications", "unread-count"],
          context.previousUnread,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
