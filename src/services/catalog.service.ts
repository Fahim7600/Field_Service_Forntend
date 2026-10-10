import {
  apiDelete,
  apiGetPaginated,
  apiPatch,
  apiPost,
} from "@/lib/api-client";
import type {
  CategoryPayload,
  ServiceCategory,
  Skill,
  SkillPayload,
} from "@/types/admin";
import type { PaginatedResponse } from "@/types/api";

export const catalogService = {
  /**
   * Retrieves paginated or full list of service categories
   */
  async fetchCategories(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServiceCategory>> {
    return apiGetPaginated<ServiceCategory>("/service-categories", {
      params: {
        limit: 100,
        ...params,
      },
    });
  },

  /**
   * Creates a new service category
   */
  async createCategory(payload: CategoryPayload): Promise<ServiceCategory> {
    return apiPost<ServiceCategory, CategoryPayload>(
      "/admin/service-categories",
      payload,
    );
  },

  /**
   * Updates an existing service category
   */
  async updateCategory(
    id: string,
    payload: Partial<CategoryPayload>,
  ): Promise<ServiceCategory> {
    return apiPatch<ServiceCategory, Partial<CategoryPayload>>(
      `/admin/service-categories/${id}`,
      payload,
    );
  },

  /**
   * Deletes a service category
   */
  async deleteCategory(id: string): Promise<null> {
    return apiDelete<null>(`/admin/service-categories/${id}`);
  },

  /**
   * Retrieves list of available technician skills
   */
  async fetchSkills(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Skill>> {
    return apiGetPaginated<Skill>("/skills", {
      params: {
        limit: 100,
        ...params,
      },
    });
  },

  /**
   * Creates a new skill in the catalog
   */
  async createSkill(payload: SkillPayload): Promise<Skill> {
    return apiPost<Skill, SkillPayload>("/admin/skills", payload);
  },
};
