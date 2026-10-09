import type { Invoice, InvoiceListItem } from "./finance";
import type { WorkOrderStatus } from "./work-order";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface FieldError {
  field?: string;
  path?: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  errors?: string[] | FieldError[] | Record<string, string[]>;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

export interface ServiceCategory {
  id: string;
  name: string;
  basePriceCents: number;
  skillId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceRequestPayload {
  categoryId: string;
  title: string;
  description: string;
  address: string;
  preferredAt: string;
  attachments?: string[];
}

export interface ServiceRequestCreated {
  id: string;
  requestNumber: string;
  title: string;
  status: string;
  priority: string;
}

export interface ServiceRequestAttachment {
  id?: string;
  fileUrl?: string;
  url?: string;
}

export type RequestStatus =
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type RequestPriority = "NORMAL" | "HIGH";

export interface CustomerRequestListItem {
  id: string;
  requestNumber?: string;
  title: string;
  description?: string;
  status: RequestStatus | string;
  priority?: RequestPriority | string;
  createdAt: string;
  preferredAt?: string;
  preferredDate?: string;
  address?: string;
  category?: { id: string; name: string } | null;
  workOrder?: {
    id: string;
    workOrderNumber?: string;
    status: WorkOrderStatus;
  } | null;
}

export interface CustomerRequestDetail {
  id: string;
  requestNumber?: string;
  title: string;
  description: string;
  status: RequestStatus | string;
  priority?: RequestPriority | string;
  createdAt: string;
  updatedAt?: string;
  preferredAt?: string;
  preferredDate?: string;
  address: string;
  reviewDueAt?: string | null;
  rejectionReason?: string | null;
  category?: {
    id: string;
    name: string;
    skillId?: string;
    basePriceCents?: number;
  } | null;
  categoryId?: string;
  attachments?: Array<
    { id?: string; fileUrl?: string; url?: string; fileName?: string } | string
  >;
  workOrder?: {
    id: string;
    workOrderNumber?: string;
    status: WorkOrderStatus;
    assignedTechnicianId?: string | null;
    visitStart?: string | null;
    visitEnd?: string | null;
    technician?: {
      id: string;
      name?: string;
      user?: {
        name: string;
        email?: string;
        phone?: string;
      };
    } | null;
    hasReport?: boolean;
    serviceReport?: {
      id?: string;
      workDone?: string;
      hoursSpent?: number;
      partsUsed?: string;
      photos?: Array<string | { url: string }>;
    } | null;
    invoiceId?: string | null;
  } | null;
}

export interface ServiceRequestListItem extends CustomerRequestListItem {}

export interface ServiceRequestDetail extends CustomerRequestDetail {
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  isReviewOverdue?: boolean;
  reviewedAt?: string | null;
  workOrderId?: string;
}

export interface ServiceRequestQueryParams {
  page?: number;
  limit?: number;
  status?: RequestStatus | string;
  priority?: RequestPriority | string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "preferredAt" | "priority" | "status" | string;
  order?: "asc" | "desc";
}

export interface CustomerServiceHistoryItem {
  id: string;
  workOrderNumber: string;
  status: WorkOrderStatus | string;
  completedAt?: string | null;
  scheduledDate?: string | null;
  visitStart?: string | null;
  visitEnd?: string | null;
  createdAt?: string;
  serviceRequestId?: string;
  category?: { id: string; name: string } | null;
  serviceRequest?: {
    id: string;
    requestNumber?: string;
    title?: string;
    category?: { id: string; name: string } | null;
  } | null;
  technician?: {
    id: string;
    name?: string;
    user?: { name: string; email?: string; phone?: string };
  } | null;
  technicianName?: string;
}

export interface CustomerServiceHistoryQueryParams {
  page?: number;
  limit?: number;
  status?: "COMPLETED" | "INVOICED" | "PAID" | "CLOSED" | "CANCELLED" | string;
  categoryId?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  order?: "asc" | "desc";
}

export * from "./work-order";

// Backward-compatibility aliases for legacy naming
export type ReviewRequestPayload = {
  decision?: "APPROVE" | "REJECT";
  status?: "APPROVED" | "REJECTED";
  reason?: string;
};
export type ReviewRequestResponse = {
  id: string;
  status: string;
};
export type ScheduleWorkOrderPayload = {
  visitStart: string;
  visitEnd: string;
};
export type AssignWorkOrderPayload = {
  technicianId: string;
};

export interface WorkOrderSummary {
  id: string;
  status: string;
  visitStart?: string | null;
  visitEnd?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  request: {
    id: string;
    requestNumber: string;
    title: string;
    priority: string;
    category: {
      id: string;
      name: string;
    };
  };
  customer: {
    id: string;
    name: string;
  };
  technician?: {
    id: string;
    name: string;
  } | null;
}

export interface ServiceReportPartItem {
  name: string;
  quantity: number;
}

export interface ServiceReportDetail {
  id: string;
  workDone: string;
  partsUsed?: ServiceReportPartItem[] | unknown;
  hoursSpent: number;
  photos?: Array<{ url: string; fileName?: string }>;
  technician?: {
    id: string;
    name: string;
  };
  createdAt?: string;
}

export interface WorkOrderFullDetail {
  id: string;
  status: string;
  visitStart?: string | null;
  visitEnd?: string | null;
  acceptedAt?: string | null;
  arrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  serviceReport?: ServiceReportDetail | null;
  request: ServiceRequestDetail;
  customer: {
    id: string;
    name: string;
  };
  technician?: {
    id: string;
    name: string;
  } | null;
}

export interface WorkOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: "createdAt" | "visitStart" | "status" | string;
  order?: "asc" | "desc";
}

export interface CreateServiceReportPayload {
  workDone: string;
  hoursSpent: number;
  partsUsed?: ServiceReportPartItem[] | string;
  files?: File[];
}

export interface UpdateWorkOrderStatusPayload {
  status: "ARRIVED" | "IN_PROGRESS" | "COMPLETED";
}

export interface RejectWorkOrderPayload {
  reason: string;
}

export interface WorkOrderDetail {
  id: string;
  workOrderNumber?: string;
  status: string;
  serviceRequestId: string;
  assignedTechnicianId?: string | null;
  technicianId?: string | null;
  visitStart?: string | null;
  visitEnd?: string | null;
  scheduledDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export * from "./finance";

// Backward compatibility type aliases
export type InvoiceSummary = InvoiceListItem;
export type InvoiceDetail = Invoice;

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: "MONTH" | "YEAR" | string;
  priceCents: number;
  description?: string;
  features?: string[];
}

export interface SubscriptionCheckoutPayload {
  planId: string;
}

export interface SubscriptionCheckoutResponse {
  checkoutUrl?: string;
  paymentUrl?: string;
  url?: string;
  sessionId?: string;
}

export interface MySubscriptionResponse {
  id: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE" | string;
  currentPeriodEnd?: string | null;
  plan?: {
    name: string;
    interval: string;
  } | null;
}

export interface DashboardTrendItem {
  date: string;
  revenue?: number;
  revenueCents?: number;
  requests?: number;
  completed?: number;
  [key: string]: string | number | undefined;
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  [key: string]: string | number;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
  [key: string]: string | number;
}

export interface DashboardStats {
  totalRevenueCents: number;
  totalRequests: number;
  activePremiumUsers: number;
  pendingDispatchCount: number;
  revenueTrend?: DashboardTrendItem[];
  requestsTrend?: DashboardTrendItem[];
  requestsByStatus?: StatusDistributionItem[];
  requestsByCategory?: CategoryDistributionItem[];
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
  status: "ACTIVE" | "SUSPENDED";
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface UpdateUserRolePayload {
  role: "ADMIN" | "TECHNICIAN" | "CUSTOMER";
}

export interface UpdateUserStatusPayload {
  status: "ACTIVE" | "SUSPENDED";
}

export * from "./work-order";
