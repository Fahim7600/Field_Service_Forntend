import {
  apiDelete,
  apiGetPaginated,
  apiPatch,
  apiPost,
} from "@/lib/api-client";
import { adminStatsService } from "@/services/admin-stats.service";
import type {
  AssignTechnicianPayload,
  AvailableTechnician,
  AvailableTechniciansQueryParams,
  DashboardStats,
  DispatchQueueItem,
  DispatchQueueQueryParams,
  PaginatedResponse,
  ReviewServiceRequestPayload,
  ReviewServiceRequestResponse,
  ScheduleVisitPayload,
  UpdateUserRolePayload,
  UpdateUserStatusPayload,
  UserListItem,
  UsersQueryParams,
} from "@/types/api";

export const adminService = {
  /**
   * Retrieves high-level analytics, revenue, volume, and distribution stats for admin overview.
   */
  async fetchDashboardStats(): Promise<DashboardStats> {
    return adminStatsService.fetchDashboardStats();
  },

  /**
   * Retrieves the admin dispatch queue (items awaiting review or technician assignment).
   */
  async fetchDispatchQueue(
    params?: DispatchQueueQueryParams,
  ): Promise<PaginatedResponse<DispatchQueueItem>> {
    return apiGetPaginated<DispatchQueueItem>("/admin/dispatch-queue", {
      params,
    });
  },

  /**
   * Reviews a submitted service request (Approves to create Work Order or Rejects with reason).
   * Exact OpenAPI schema: { decision: "APPROVE" | "REJECT", reason?: string }
   */
  async reviewRequest(
    id: string,
    payload: ReviewServiceRequestPayload,
  ): Promise<ReviewServiceRequestResponse> {
    return apiPatch<ReviewServiceRequestResponse, ReviewServiceRequestPayload>(
      `/admin/service-requests/${id}/review`,
      {
        decision: payload.decision,
        ...(payload.reason ? { reason: payload.reason } : {}),
      },
    );
  },

  /**
   * Retrieves active technicians available for a specific skill and time window.
   */
  async fetchAvailableTechnicians(
    params: AvailableTechniciansQueryParams,
  ): Promise<PaginatedResponse<AvailableTechnician>> {
    return apiGetPaginated<AvailableTechnician>(
      "/admin/technicians/available",
      {
        params,
      },
    );
  },

  /**
   * Assigns an available technician to a work order.
   */
  async assignTechnician(
    id: string,
    payload: AssignTechnicianPayload,
  ): Promise<{ id: string; status: string }> {
    return apiPost<{ id: string; status: string }, AssignTechnicianPayload>(
      `/work-orders/${id}/assign`,
      payload,
    );
  },

  /**
   * Schedules a visit window for a work order.
   */
  async scheduleVisit(
    id: string,
    payload: ScheduleVisitPayload,
  ): Promise<{ id: string; status: string }> {
    return apiPost<{ id: string; status: string }, ScheduleVisitPayload>(
      `/work-orders/${id}/schedule`,
      payload,
    );
  },

  // Backward-compatibility aliases
  async assignWorkOrder(
    id: string,
    payload: AssignTechnicianPayload,
  ): Promise<{ id: string; status: string }> {
    return this.assignTechnician(id, payload);
  },

  async scheduleWorkOrder(
    id: string,
    payload: ScheduleVisitPayload,
  ): Promise<{ id: string; status: string }> {
    return this.scheduleVisit(id, payload);
  },

  /**
   * Retrieves paginated list of all users in the system (Supports search, role, status filters).
   */
  async fetchUsers(
    params?: UsersQueryParams,
  ): Promise<PaginatedResponse<UserListItem>> {
    return apiGetPaginated<UserListItem>("/admin/users", {
      params,
    });
  },

  /**
   * Modifies a user's role (ADMIN | TECHNICIAN | CUSTOMER).
   */
  async updateUserRole(
    id: string,
    payload: UpdateUserRolePayload,
  ): Promise<{ id: string; name?: string; role: string }> {
    return apiPatch<
      { id: string; name?: string; role: string },
      UpdateUserRolePayload
    >(`/admin/users/${id}/role`, payload);
  },

  /**
   * Modifies a user's account status (ACTIVE | SUSPENDED).
   */
  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload,
  ): Promise<{ id: string; name?: string; status: string }> {
    return apiPatch<
      { id: string; name?: string; status: string },
      UpdateUserStatusPayload
    >(`/admin/users/${id}/status`, payload);
  },

  /**
   * Deletes a user account (Admin cannot delete themselves).
   */
  async deleteUser(id: string): Promise<null> {
    return apiDelete<null>(`/admin/users/${id}`);
  },
};
