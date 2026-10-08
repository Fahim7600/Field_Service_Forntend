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
  id: string;
  fileUrl: string;
}
