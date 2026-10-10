export type NotificationType = string;

/**
 * Notification item per live backend shape 7:
 * { id, type, title, message, data: { workOrderId?, invoiceId?, paymentId?, requestId? ... } | null, isRead, createdAt }
 */
export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
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
