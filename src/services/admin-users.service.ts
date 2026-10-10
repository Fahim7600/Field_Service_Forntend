import { apiDelete, apiGetPaginated, apiPatch } from "@/lib/api-client";
import type {
  AdminUser,
  AdminUsersParams,
  UserRole,
  UserStatus,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";

export const adminUsersService = {
  /**
   * Retrieves paginated list of users with search, role, status filters
   */
  async fetchAdminUsers(
    params?: AdminUsersParams,
  ): Promise<PaginatedResponse<AdminUser>> {
    return apiGetPaginated<AdminUser>("/admin/users", {
      params,
    });
  },

  /**
   * Promotes or changes a user's role (CUSTOMER, TECHNICIAN, ADMIN)
   */
  async changeUserRole(id: string, role: UserRole): Promise<AdminUser> {
    return apiPatch<AdminUser, { role: UserRole }>(`/admin/users/${id}/role`, {
      role,
    });
  },

  /**
   * Updates a user's account status (ACTIVE, SUSPENDED)
   */
  async changeUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
    return apiPatch<AdminUser, { status: UserStatus }>(
      `/admin/users/${id}/status`,
      { status },
    );
  },

  /**
   * Soft-deletes a user account
   */
  async deleteUser(id: string): Promise<null> {
    return apiDelete<null>(`/admin/users/${id}`);
  },
};
