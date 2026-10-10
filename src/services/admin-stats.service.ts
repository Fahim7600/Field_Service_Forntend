import { apiGet } from "@/lib/api-client";
import type { DashboardStats, TechnicianAnalytics } from "@/types/admin";

export const adminStatsService = {
  /**
   * Retrieves high-level operational statistics and metrics for the admin overview.
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    return apiGet<DashboardStats>("/admin/dashboard-stats");
  },

  /**
   * Retrieves individual technician analytics (completed jobs, ratings, on-time rate).
   */
  async fetchTechnicianAnalytics(id: string): Promise<TechnicianAnalytics> {
    return apiGet<TechnicianAnalytics>(`/admin/technicians/${id}/analytics`);
  },
};
