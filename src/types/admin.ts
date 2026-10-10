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
}

/**
 * Audit log entry per live shape:
 * { id, action, entity, entityId, oldValues, newValues, ipAddress, createdAt, actor: { id, name, email } | null }
 */
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actor: AuditLogActor | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
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
}

export interface FeedbackTechnician {
  id: string;
  name?: string | null;
}

export interface FeedbackWorkOrderRef {
  id: string;
  workOrderNumber?: string;
}

/**
 * Feedback item per live shape 5:
 * { id, rating, comment, createdAt, technician: { id, name }, customer: { id, name }, workOrder: { id }, requestNumber }
 */
export interface FeedbackItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  technician?: FeedbackTechnician | null;
  customer?: FeedbackCustomer | null;
  workOrder?: FeedbackWorkOrderRef | null;
  workOrderId?: string;
  requestNumber?: string | null;
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

export interface SubscriptionPlanRef {
  id?: string;
  name: string;
  interval: string;
  priceCents?: number;
}

export interface SubscriptionCustomerRef {
  id: string;
  name?: string | null;
  email?: string | null;
}

/**
 * Subscription item per live shape 6:
 * { id, status, plan: { id, name, interval, priceCents }, customer: { id, name, email }, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt }
 */
export interface SubscriptionListItem {
  id: string;
  status: SubscriptionStatus | string;
  plan?: SubscriptionPlanRef | null;
  customer?: SubscriptionCustomerRef | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  createdAt?: string;
}

export interface SubscriptionListParams {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus | string;
  sortBy?: "createdAt" | string;
  order?: "asc" | "desc";
}

export interface RequestsByStatusItem {
  status: string;
  count: number;
}

export interface DashboardRevenueStats {
  currency?: string;
  revenueCents?: number;
  refundedCents?: number;
  paymentCount?: number;
}

export interface RawDashboardStats {
  requestsByStatus?: Record<string, number> | RequestsByStatusItem[] | null;
  workOrdersByStatus?: Record<string, number> | RequestsByStatusItem[] | null;
  revenue?: DashboardRevenueStats | null;
  activePremiumUsers?: number | null;
  lateReviews?: number | null;
  generatedAt?: string | null;
  totalRevenueCents?: number | null;
  revenueCents?: number | null;
  totalRequests?: number | null;
  totalTechnicians?: number | null;
  activeWorkOrders?: number | null;
  pendingRequests?: number | null;
}

export interface DashboardStats {
  revenueCents: number;
  refundedCents: number;
  paymentCount: number;
  currency: string;
  requestsByStatus: RequestsByStatusItem[];
  workOrdersByStatus: RequestsByStatusItem[];
  totalRequests: number;
  activeJobs: number;
  activePremiumUsers: number;
  lateReviews: number;
  generatedAt?: string | null;
  totalRevenueCents?: number;
}

export interface TechnicianAnalytics {
  technician?: {
    id: string;
    name?: string | null;
  } | null;
  jobsDone?: number | null;
  averageRating?: number | null;
  ratingCount?: number | null;
  onTimeRate?: number | null;
  measuredJobs?: number | null;
  averageJobMinutes?: number | null;
}
