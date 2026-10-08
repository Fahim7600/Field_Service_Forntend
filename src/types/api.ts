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

export interface ServiceRequestListItem {
  id: string;
  requestNumber: string;
  title: string;
  status: RequestStatus | string;
  priority?: RequestPriority | string;
  preferredDate?: string;
  preferredAt?: string;
  category?: { id: string; name: string } | null;
  createdAt: string;
}

export interface ServiceRequestDetail {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  status: RequestStatus | string;
  priority: RequestPriority | string;
  preferredDate?: string;
  preferredAt?: string;
  address?: string;
  category?: { id: string; name: string; skillId?: string } | null;
  categoryId?: string;
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  attachments?: Array<
    { id?: string; fileUrl?: string; url?: string; fileName?: string } | string
  >;
  isReviewOverdue?: boolean;
  reviewDueAt?: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  workOrder?: {
    id: string;
    status: string;
    technicianId?: string | null;
    visitStart?: string | null;
    visitEnd?: string | null;
  } | null;
  workOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface DispatchQueueItem {
  type?: "REQUEST_REVIEW" | "NEEDS_TECHNICIAN";
  id: string;
  requestId?: string;
  requestNumber: string;
  title?: string;
  priority: RequestPriority | string;
  isPremium?: boolean;
  isLate?: boolean;
  reviewDueAt?: string;
  createdAt: string;
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    skillId?: string;
  } | null;
  returned?: {
    reason: string | null;
    technician: {
      id: string;
      name: string;
    };
    at: string;
  } | null;
}

export interface DispatchQueueQueryParams {
  page?: number;
  limit?: number;
  type?: "REQUEST_REVIEW" | "NEEDS_TECHNICIAN";
}

export interface ReviewRequestPayload {
  status?: "APPROVED" | "REJECTED";
  decision?: "APPROVE" | "REJECT";
  reason?: string;
}

export interface ReviewRequestResponse {
  request: {
    id: string;
    requestNumber: string;
    status: string;
  };
  workOrder: {
    id: string;
    status: string;
  } | null;
}

export interface AvailableTechnician {
  id: string;
  name: string;
  serviceArea?: string | null;
  yearsOfExperience?: number;
  skills: Array<{ id: string; name: string } | string>;
  activeJobCount?: number;
}

export interface AvailableTechniciansQueryParams {
  skillId: string;
  start: string;
  end: string;
  page?: number;
  limit?: number;
}

export interface ScheduleWorkOrderPayload {
  visitStart: string;
  visitEnd: string;
}

export interface AssignWorkOrderPayload {
  technicianId: string;
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
