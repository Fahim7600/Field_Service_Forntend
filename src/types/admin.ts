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

export interface AuditLogActor {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityType?: string;
  entityId: string;
  actorId?: string | null;
  actor?: AuditLogActor | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string;
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entity?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FeedbackCustomer {
  id: string;
  name?: string | null;
  email?: string | null;
}

export interface FeedbackTechnician {
  id: string;
  name?: string | null;
}

export interface FeedbackItem {
  id: string;
  workOrderId: string;
  customerId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: FeedbackCustomer | null;
  customerName?: string | null;
  technician?: FeedbackTechnician | null;
  technicianName?: string | null;
  workOrderNumber?: string | null;
  workOrder?: {
    id: string;
    workOrderNumber?: string;
  } | null;
}

export interface FeedbackParams {
  page?: number;
  limit?: number;
  technicianId?: string;
  rating?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED"
  | "INACTIVE";

export interface SubscriptionListItem {
  id: string;
  userId: string;
  status: SubscriptionStatus | string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  customerName?: string | null;
  customerEmail?: string | null;
  plan?: {
    id?: string;
    name: string;
    interval: string;
    priceCents?: number;
  } | null;
  planName?: string | null;
  planInterval?: string | null;
}

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus | string;
  sortBy?: "createdAt" | string;
  order?: "asc" | "desc";
}
