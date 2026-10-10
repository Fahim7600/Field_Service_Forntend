import { apiGetPaginated } from "@/lib/api-client";
import type {
  AuditLog,
  AuditLogParams,
  FeedbackItem,
  FeedbackParams,
  SubscriptionListItem,
  SubscriptionListParams,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";

export const adminLogsService = {
  /**
   * Retrieves paginated audit trail logs from /admin/audit-logs
   */
  async fetchAuditLogs(
    params?: AuditLogParams,
  ): Promise<PaginatedResponse<AuditLog>> {
    return apiGetPaginated<AuditLog>("/admin/audit-logs", {
      params,
    });
  },

  /**
   * Retrieves paginated customer feedback ratings and reviews from /feedback
   */
  async fetchFeedback(
    params?: FeedbackParams,
  ): Promise<PaginatedResponse<FeedbackItem>> {
    return apiGetPaginated<FeedbackItem>("/feedback", {
      params,
    });
  },

  /**
   * Retrieves paginated list of all customer subscriptions from /admin/subscriptions
   */
  async fetchSubscriptions(
    params?: SubscriptionListParams,
  ): Promise<PaginatedResponse<SubscriptionListItem>> {
    return apiGetPaginated<SubscriptionListItem>("/admin/subscriptions", {
      params,
    });
  },
};
