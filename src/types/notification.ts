export type NotificationType =
  | "REQUEST_SUBMITTED"
  | "REQUEST_APPROVED"
  | "REQUEST_REJECTED"
  | "TECHNICIAN_ASSIGNED"
  | "VISIT_SCHEDULED"
  | "JOB_STARTED"
  | "JOB_COMPLETED"
  | "JOB_CANCELLED"
  | "INVOICE_ISSUED"
  | "INVOICE_PAID"
  | "PAYMENT_RECEIVED"
  | "REFUND_ISSUED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_CANCELLED"
  | "SUBSCRIPTION_PAST_DUE"
  | "SYSTEM_ALERT"
  | "UNKNOWN";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
  type?: NotificationType | string;
  userId?: string;
  requestId?: string;
  workOrderId?: string;
  invoiceId?: string;
  paymentId?: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, unknown>;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: "true" | "false" | boolean;
}

export interface MarkReadResponse {
  id: string;
  isRead: boolean;
}

export interface MarkAllReadResponse {
  count: number;
}
