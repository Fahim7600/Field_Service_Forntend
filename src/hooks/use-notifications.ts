"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api-client";
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
export function useDocumentVisibility(): boolean {
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
 * Fetches total unread count using the backend isRead=false query filter.
 * Polls every 30s only while the tab is visible.
 */
export function useUnreadCount() {
  const isVisible = useDocumentVisibility();
  const status = useAuthStore((state) => state.status);
  const isAuthenticated = status === "authenticated";

  const query = useQuery<PaginatedResponse<Notification>>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () =>
      notificationsService.fetchNotifications({
        page: 1,
        limit: 1,
        isRead: "false",
      }),
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

  const rawCount = query.data?.pagination?.total ?? 0;
  const count = Math.max(0, rawCount);
  const formatted = count > 9 ? "9+" : String(count);

  return {
    ...query,
    count,
    formatted,
    hasUnread: count > 0,
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

      // 1. Update Preview cache
      if (previousPreview) {
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "preview"],
          {
            ...previousPreview,
            data: previousPreview.data.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          },
        );
      }

      // 2. Decrement Unread count cache
      if (previousUnread?.pagination) {
        const newTotal = Math.max(0, previousUnread.pagination.total - 1);
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "unread-count"],
          {
            ...previousUnread,
            pagination: {
              ...previousUnread.pagination,
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
          return {
            ...old,
            data: old.data.map((n) =>
              n.id === id ? { ...n, isRead: true } : n,
            ),
          };
        },
      );

      return { previousPreview, previousUnread };
    },
    onError: (err, _vars, context) => {
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
      toast.error("Failed to mark notification as read", {
        description: getErrorMessage(err),
      });
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousPreview = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "preview"]);
      const previousUnread = queryClient.getQueryData<
        PaginatedResponse<Notification>
      >(["notifications", "unread-count"]);

      // 1. Update Preview cache
      if (previousPreview) {
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "preview"],
          {
            ...previousPreview,
            data: previousPreview.data.map((n) => ({ ...n, isRead: true })),
          },
        );
      }

      // 2. Clear unread count cache
      if (previousUnread?.pagination) {
        queryClient.setQueryData<PaginatedResponse<Notification>>(
          ["notifications", "unread-count"],
          {
            ...previousUnread,
            pagination: {
              ...previousUnread.pagination,
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
          return {
            ...old,
            data: old.data.map((n) => ({ ...n, isRead: true })),
          };
        },
      );

      return { previousPreview, previousUnread };
    },
    onError: (err, _vars, context) => {
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
      toast.error("Failed to mark all as read", {
        description: getErrorMessage(err),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
