export type UserRole = "ADMIN" | "TECHNICIAN" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface Skill {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillPayload {
  name: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  basePriceCents: number;
  skillId: string;
  skill?: Skill | { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  skillId: string;
  basePriceCents: number;
}
