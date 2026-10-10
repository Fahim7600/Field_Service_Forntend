import { apiGetPaginated, apiPatch } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type {
  MarkAllReadResponse,
  MarkReadResponse,
  Notification,
  NotificationListParams,
} from "@/types/notification";

export const notificationsService = {
  /**
   * Retrieves a paginated list of notifications for the authenticated user.
   */
  async fetchNotifications(
    params?: NotificationListParams,
  ): Promise<PaginatedResponse<Notification>> {
    const formattedParams: Record<string, string | number | undefined> = {};

    if (params?.page !== undefined) {
      formattedParams.page = params.page;
    }
    if (params?.limit !== undefined) {
      formattedParams.limit = params.limit;
    }
    if (params?.isRead !== undefined) {
      formattedParams.isRead =
        typeof params.isRead === "boolean"
          ? params.isRead
            ? "true"
            : "false"
          : params.isRead;
    }

    return apiGetPaginated<Notification>("/notifications", {
      params: formattedParams,
    });
  },

  /**
   * Marks a single notification as read.
   */
  async markNotificationRead(id: string): Promise<MarkReadResponse> {
    return apiPatch<MarkReadResponse>(`/notifications/${id}/read`);
  },

  /**
   * Marks all unread notifications as read for the current user.
   */
  async markAllNotificationsRead(): Promise<MarkAllReadResponse> {
    return apiPatch<MarkAllReadResponse>("/notifications/read-all");
  },
};
