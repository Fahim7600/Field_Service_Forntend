import { apiGet, apiGetPaginated, apiPatch, apiPut } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types/api";
import type { User } from "@/types/auth";

export interface UpdateMePayload {
  name?: string;
  phone?: string;
  address?: string;
}

export interface WorkingHourSlot {
  start: string;
  end: string;
}

export interface UpdateTechnicianProfilePayload {
  bio?: string;
  serviceArea?: string;
  workingHours?: {
    monday?: WorkingHourSlot | null;
    tuesday?: WorkingHourSlot | null;
    wednesday?: WorkingHourSlot | null;
    thursday?: WorkingHourSlot | null;
    friday?: WorkingHourSlot | null;
    saturday?: WorkingHourSlot | null;
    sunday?: WorkingHourSlot | null;
  };
}

export interface SkillItem {
  id: string;
  name: string;
  description?: string;
  basePriceCents?: number;
  createdAt?: string;
}

export const usersService = {
  /**
   * Retrieves the current authenticated user profile.
   */
  async getMe(): Promise<User> {
    return apiGet<User>("/users/me");
  },

  /**
   * Updates current user profile details (name, phone, address).
   */
  async updateMe(payload: UpdateMePayload): Promise<User> {
    return apiPatch<User, UpdateMePayload>("/users/me", payload);
  },

  /**
   * Updates technician-specific professional profile (bio, service area, working hours).
   */
  async updateTechnicianProfile(
    payload: UpdateTechnicianProfilePayload,
  ): Promise<Record<string, unknown>> {
    return apiPatch<Record<string, unknown>, UpdateTechnicianProfilePayload>(
      "/technicians/me/profile",
      payload,
    );
  },

  /**
   * Updates technician skill assignments.
   */
  async updateTechnicianSkills(skillIds: string[]): Promise<{
    technicianId: string;
    skills: Array<{ id: string; name: string }>;
  }> {
    return apiPut<
      { technicianId: string; skills: Array<{ id: string; name: string }> },
      { skillIds: string[] }
    >("/technicians/me/skills", { skillIds });
  },

  /**
   * Fetches all available system service skills.
   */
  async fetchSkills(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SkillItem>> {
    return apiGetPaginated<SkillItem>("/skills", { params });
  },
};
