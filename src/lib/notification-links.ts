import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  type LucideIcon,
  RefreshCcw,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import type { Role } from "@/types/auth";
import type { Notification } from "@/types/notification";

export type NotificationTone =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export interface NotificationVisualConfig {
  icon: LucideIcon;
  tone: NotificationTone;
}

/**
 * Returns an icon and visual color tone for a notification type.
 */
export function getNotificationVisual(
  type?: string | null,
): NotificationVisualConfig {
  const normalized = (type || "").toUpperCase().trim();

  switch (normalized) {
    case "REQUEST_SUBMITTED":
    case "REQUEST_APPROVED":
      return { icon: CheckCircle2, tone: "success" };

    case "REQUEST_REJECTED":
      return { icon: XCircle, tone: "danger" };

    case "TECHNICIAN_ASSIGNED":
      return { icon: Wrench, tone: "info" };

    case "VISIT_SCHEDULED":
      return { icon: Calendar, tone: "info" };

    case "JOB_STARTED":
      return { icon: Clock, tone: "info" };

    case "JOB_COMPLETED":
      return { icon: CheckCircle, tone: "success" };

    case "JOB_CANCELLED":
      return { icon: AlertTriangle, tone: "danger" };

    case "INVOICE_ISSUED":
      return { icon: FileText, tone: "warning" };

    case "INVOICE_PAID":
    case "PAYMENT_RECEIVED":
      return { icon: CreditCard, tone: "success" };

    case "REFUND_ISSUED":
      return { icon: RefreshCcw, tone: "warning" };

    case "SUBSCRIPTION_ACTIVATED":
      return { icon: Sparkles, tone: "success" };

    case "SUBSCRIPTION_CANCELLED":
    case "SUBSCRIPTION_PAST_DUE":
      return { icon: AlertTriangle, tone: "warning" };

    default:
      return { icon: Bell, tone: "neutral" };
  }
}

/**
 * Determines the target route for a notification based on real payload references and user role.
 * Returns null if the required reference ID does not exist in the notification data.
 */
export function getNotificationHref(
  notification: Notification,
  role?: Role | string | null,
): string | null {
  const normalizedRole = (role || "").toUpperCase();
  const normalizedType = (notification.type || "").toUpperCase();

  // Extract reference IDs safely from direct fields, entity fields, or data payload
  const requestId =
    notification.requestId ||
    (notification.entityType?.toLowerCase() === "servicerequest"
      ? notification.entityId
      : undefined) ||
    (notification.data?.requestId as string | undefined);

  const workOrderId =
    notification.workOrderId ||
    (notification.entityType?.toLowerCase() === "workorder"
      ? notification.entityId
      : undefined) ||
    (notification.data?.workOrderId as string | undefined);

  const invoiceId =
    notification.invoiceId ||
    (notification.entityType?.toLowerCase() === "invoice"
      ? notification.entityId
      : undefined) ||
    (notification.data?.invoiceId as string | undefined);

  // 1. Customer Navigation
  if (normalizedRole === "CUSTOMER") {
    if (normalizedType.includes("SUBSCRIPTION")) {
      return "/customer/premium";
    }

    if (invoiceId) {
      return `/customer/invoices/${invoiceId}`;
    }

    if (normalizedType.includes("INVOICE")) {
      return "/customer/invoices";
    }

    if (
      normalizedType.includes("PAYMENT") ||
      normalizedType.includes("REFUND")
    ) {
      return "/customer/payments";
    }

    if (requestId) {
      return `/customer/requests/${requestId}`;
    }

    return null;
  }

  // 2. Technician Navigation
  if (normalizedRole === "TECHNICIAN") {
    if (workOrderId) {
      return `/technician/tasks/${workOrderId}`;
    }

    if (normalizedType.includes("SCHEDULE")) {
      return "/technician/schedule";
    }

    return null;
  }

  // 3. Admin Navigation
  if (normalizedRole === "ADMIN") {
    if (workOrderId) {
      return `/admin/work-orders/${workOrderId}`;
    }

    if (requestId) {
      return `/admin/dispatch/${requestId}`;
    }

    if (invoiceId) {
      return `/admin/invoices/${invoiceId}`;
    }

    if (
      normalizedType.includes("PAYMENT") ||
      normalizedType.includes("REFUND")
    ) {
      return "/admin/payments";
    }

    return null;
  }

  return null;
}
