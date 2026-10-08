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
  category?: { id: string; name: string } | null;
  categoryId?: string;
  attachments?: Array<{ id?: string; fileUrl?: string; url?: string } | string>;
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
