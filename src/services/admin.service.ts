import {
  apiDelete,
  apiGet,
  apiGetPaginated,
  apiPatch,
  apiPost,
} from "@/lib/api-client";
import type {
  AssignWorkOrderPayload,
  AvailableTechnician,
  AvailableTechniciansQueryParams,
  DashboardStats,
  DispatchQueueItem,
  DispatchQueueQueryParams,
  PaginatedResponse,
  ReviewRequestPayload,
  ReviewRequestResponse,
  ScheduleWorkOrderPayload,
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
    return apiGet<DashboardStats>("/admin/dashboard-stats");
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
   */
  async reviewRequest(
    id: string,
    payload: ReviewRequestPayload,
  ): Promise<ReviewRequestResponse> {
    const decision =
      payload.decision ??
      (payload.status === "APPROVED" ? "APPROVE" : "REJECT");

    return apiPatch<
      ReviewRequestResponse,
      { decision: "APPROVE" | "REJECT"; reason?: string }
    >(`/admin/service-requests/${id}/review`, {
      decision,
      ...(payload.reason ? { reason: payload.reason } : {}),
    });
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
   * Schedules a visit window for a work order.
   */
  async scheduleWorkOrder(
    id: string,
    payload: ScheduleWorkOrderPayload,
  ): Promise<{ workOrder: unknown }> {
    return apiPost<{ workOrder: unknown }, ScheduleWorkOrderPayload>(
      `/work-orders/${id}/schedule`,
      payload,
    );
  },

  /**
   * Assigns an available technician to a work order.
   */
  async assignWorkOrder(
    id: string,
    payload: AssignWorkOrderPayload,
  ): Promise<{ workOrder: unknown }> {
    return apiPost<{ workOrder: unknown }, AssignWorkOrderPayload>(
      `/work-orders/${id}/assign`,
      payload,
    );
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
  ): Promise<UserListItem> {
    return apiPatch<UserListItem, UpdateUserRolePayload>(
      `/admin/users/${id}/role`,
      payload,
    );
  },

  /**
   * Changes a user's status (ACTIVE | SUSPENDED).
   */
  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload,
  ): Promise<UserListItem> {
    return apiPatch<UserListItem, UpdateUserStatusPayload>(
      `/admin/users/${id}/status`,
      payload,
    );
  },

  /**
   * Deletes a user account.
   */
  async deleteUser(id: string): Promise<unknown> {
    return apiDelete<unknown>(`/admin/users/${id}`);
  },
};
