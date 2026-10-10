/**
 * Work Order & Dispatch Domain Types
 * Exactly aligned with docs/openapi.json
 */

export type WorkOrderStatus =
  | "APPROVED"
  | "ASSIGNED"
  | "SCHEDULED"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "INVOICED"
  | "PAID"
  | "CLOSED"
  | "CANCELLED";

export type ServiceRequestStatus = "SUBMITTED" | "APPROVED" | "REJECTED";

export type Priority = "NORMAL" | "HIGH";

export interface WorkOrderStatusHistoryItem {
  id: string;
  fromStatus?: string | null;
  toStatus: string;
  reason?: string | null;
  note?: string | null;
  changedBy?:
    | {
        id: string;
        name: string;
        role?: string;
      }
    | string
    | null;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber?: string;
  status: WorkOrderStatus | string;
  serviceRequestId: string;
  requestId?: string;
  assignedTechnicianId?: string | null;
  technicianId?: string | null;
  visitStart?: string | null;
  visitEnd?: string | null;
  scheduledDate?: string | null;
  acceptedAt?: string | null;
  arrivedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  hasReport?: boolean;
  serviceReport?: {
    id: string;
    workOrderId?: string;
    workDone?: string;
    hoursSpent?: number;
    partsUsed?: unknown;
    photos?: Array<{ url: string; fileName?: string } | string>;
    createdAt?: string;
    technician?: {
      id: string;
      name: string;
    };
  } | null;
  createdAt: string;
  updatedAt?: string;
  invoiceId?: string | null;
  technician?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  request?: {
    id: string;
    requestNumber: string;
    title: string;
    description?: string;
    status?: string;
    priority?: Priority | string;
    address?: string;
    category?: {
      id: string;
      name: string;
      skillId?: string;
    };
  } | null;
}

export interface TechnicianTask {
  id: string;
  workOrderNumber?: string;
  status: WorkOrderStatus | string;
  serviceRequestId?: string;
  visitStart?: string | null;
  visitEnd?: string | null;
  scheduledDate?: string | null;
  acceptedAt?: string | null;
  hasReport?: boolean;
  serviceReport?: WorkOrder["serviceReport"];
  createdAt?: string;
  updatedAt?: string;
  customer?: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;
  request?: {
    id: string;
    requestNumber?: string;
    title: string;
    description?: string;
    status?: string;
    priority?: Priority | string;
    address?: string;
    category?: {
      id: string;
      name: string;
      skillId?: string;
    } | null;
  } | null;
}

export interface TechnicianTasksQueryParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  sortBy?: "createdAt" | "visitStart" | "status";
  order?: "asc" | "desc";
}

export interface WorkOrdersQueryParams {
  page?: number;
  limit?: number;
  status?: WorkOrderStatus;
  sortBy?: "createdAt" | "visitStart" | "status";
  order?: "asc" | "desc";
}

export interface AvailableTechnician {
  id: string;
  name: string;
  skills: Array<{ id: string; name: string } | string>;
  activeJobCount: number;
  serviceArea?: string | null;
  yearsOfExperience?: number;
}

export interface AvailableTechniciansQueryParams {
  skillId: string;
  start?: string;
  end?: string;
  page?: number;
  limit?: number;
}

export interface AssignTechnicianPayload {
  technicianId: string;
}

export interface ScheduleVisitPayload {
  visitStart: string;
  visitEnd: string;
}

export interface ReviewServiceRequestPayload {
  decision: "APPROVE" | "REJECT";
  reason?: string;
}

export interface ReviewServiceRequestResponse {
  id: string;
  status: string;
}

export interface DispatchQueueItem {
  id: string;
  requestNumber: string;
  priority: Priority | string;
  isPremium: boolean;
  createdAt: string;
  title?: string;
  type?: "REQUEST_REVIEW" | "NEEDS_TECHNICIAN";
  isLate?: boolean;
  isReviewOverdue?: boolean;
  reviewDueAt?: string;
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

export interface SubmitServiceReportPayload {
  workDone: string;
  hoursSpent: number;
  partsUsed?: string;
  photos?: string[];
}

export interface WorkOrderFeedback {
  id: string;
  workOrderId?: string;
  rating: number;
  comment?: string | null;
  createdAt?: string;
}

export interface SubmitFeedbackPayload {
  rating: number;
  comment?: string;
}
