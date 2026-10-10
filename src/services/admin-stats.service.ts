import { apiGet } from "@/lib/api-client";
import { normalizeRequestsByStatus } from "@/lib/stats-utils";
import type {
  DashboardStats,
  RawDashboardStats,
  TechnicianAnalytics,
} from "@/types/admin";

const ACTIVE_JOB_STATUSES = new Set([
  "ASSIGNED",
  "SCHEDULED",
  "ARRIVED",
  "IN_PROGRESS",
]);

export const adminStatsService = {
  /**
   * Retrieves high-level operational statistics and metrics for the admin overview.
   * Tolerantly normalizes real backend response shape (revenue object, workOrdersByStatus, requestsByStatus).
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    const raw = await apiGet<RawDashboardStats>("/admin/dashboard-stats");

    const reqStatusList = normalizeRequestsByStatus(raw?.requestsByStatus);
    const woStatusList = normalizeRequestsByStatus(raw?.workOrdersByStatus);

    const revenueCents =
      raw?.revenue?.revenueCents ??
      raw?.revenueCents ??
      raw?.totalRevenueCents ??
      0;
    const refundedCents = raw?.revenue?.refundedCents ?? 0;
    const paymentCount = raw?.revenue?.paymentCount ?? 0;
    const currency = raw?.revenue?.currency ?? "USD";

    // Total requests = sum of requests by status (or legacy totalRequests/pending+active fallback)
    const totalRequests =
      reqStatusList.length > 0
        ? reqStatusList.reduce((acc, item) => acc + item.count, 0)
        : (raw?.totalRequests ??
          (raw?.activeWorkOrders ?? 0) + (raw?.pendingRequests ?? 0));

    // Active jobs = sum of ASSIGNED, SCHEDULED, ARRIVED, IN_PROGRESS in workOrdersByStatus
    let activeJobs = 0;
    if (woStatusList.length > 0) {
      for (const item of woStatusList) {
        if (ACTIVE_JOB_STATUSES.has(item.status.toUpperCase())) {
          activeJobs += item.count;
        }
      }
    } else {
      activeJobs = raw?.activeWorkOrders ?? 0;
    }

    const activePremiumUsers = raw?.activePremiumUsers ?? 0;
    const lateReviews = raw?.lateReviews ?? 0;
    const generatedAt = raw?.generatedAt ?? null;

    return {
      revenueCents,
      refundedCents,
      paymentCount,
      currency,
      requestsByStatus: reqStatusList,
      workOrdersByStatus: woStatusList,
      totalRequests,
      activeJobs,
      activePremiumUsers,
      lateReviews,
      generatedAt,
      totalRevenueCents: revenueCents,
    };
  },

  /**
   * Retrieves individual technician analytics (completed jobs, ratings, on-time rate).
   * Tolerantly normalizes real backend fields (technician object, jobsDone, ratingCount, onTimeRate, averageJobMinutes).
   */
  async fetchTechnicianAnalytics(id: string): Promise<TechnicianAnalytics> {
    const raw = await apiGet<TechnicianAnalytics>(
      `/admin/technicians/${id}/analytics`,
    );

    return {
      technician: raw?.technician ?? null,
      jobsDone: raw?.jobsDone ?? 0,
      averageRating: raw?.averageRating ?? 0,
      ratingCount: raw?.ratingCount ?? null,
      onTimeRate: raw?.onTimeRate ?? null,
      measuredJobs: raw?.measuredJobs ?? null,
      averageJobMinutes: raw?.averageJobMinutes ?? null,
    };
  },
};
