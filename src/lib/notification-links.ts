import {
  Bell,
  ClipboardList,
  CreditCard,
  Crown,
  type LucideIcon,
  RotateCcw,
  Wrench,
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
 * Returns an icon and visual color tone for a notification type via substring matching.
 */
export function getNotificationVisual(
  type?: string | null,
): NotificationVisualConfig {
  const upper = (type || "").toUpperCase().trim();

  // Tone resolution by substring
  let tone: NotificationTone = "info";
  if (
    upper.includes("FAILED") ||
    upper.includes("REJECT") ||
    upper.includes("CANCEL")
  ) {
    tone = "danger";
  } else if (
    upper.includes("SUCCEEDED") ||
    upper.includes("PAID") ||
    upper.includes("APPROVED") ||
    upper.includes("COMPLETED") ||
    upper.includes("ACTIVATED")
  ) {
    tone = "success";
  } else if (upper.includes("PAST_DUE") || upper.includes("EXPIRED")) {
    tone = "warning";
  }

  // Icon resolution by substring
  if (upper.includes("PAYMENT") || upper.includes("INVOICE")) {
    return { icon: CreditCard, tone };
  }
  if (upper.includes("SUBSCRIPTION")) {
    return { icon: Crown, tone };
  }
  if (
    upper.includes("ASSIGNED") ||
    upper.includes("SCHEDULED") ||
    upper.includes("WORK_ORDER") ||
    upper.includes("JOB")
  ) {
    return { icon: Wrench, tone };
  }
  if (upper.includes("REQUEST")) {
    return { icon: ClipboardList, tone };
  }
  if (upper.includes("REFUND")) {
    return { icon: RotateCcw, tone };
  }

  return { icon: Bell, tone: "neutral" };
}

function getStringId(data: unknown, key: string): string | null {
  if (typeof data !== "object" || data === null) return null;
  const val = (data as Record<string, unknown>)[key];
  if (typeof val === "string" && val.trim().length > 0) {
    return val.trim();
  }
  return null;
}

/**
 * Determines the target route for a notification based on real payload references and user role.
 * Priority:
 * 1. data.invoiceId: CUSTOMER /customer/invoices/{id}, ADMIN /admin/invoices/{id}
 * 2. data.requestId: CUSTOMER /customer/requests/{id}, ADMIN /admin/dispatch/{id}
 * 3. data.workOrderId: TECHNICIAN /technician/tasks/{id}, ADMIN /admin/work-orders/{id}, CUSTOMER /customer/jobs/{id}
 * 4. data.paymentId (no invoice): CUSTOMER /customer/payments, ADMIN /admin/payments
 * 5. type contains "SUBSCRIPTION": CUSTOMER /customer/premium
 * 6. Otherwise null (the click only marks as read)
 */
export function getNotificationHref(
  notification: Notification,
  role?: Role | string | null,
): string | null {
  const normalizedRole = (role || "").toUpperCase();
  const upperType = (notification.type || "").toUpperCase();
  const data = notification.data;

  const invoiceId = getStringId(data, "invoiceId");
  const requestId =
    getStringId(data, "requestId") ?? getStringId(data, "serviceRequestId");
  const workOrderId = getStringId(data, "workOrderId");
  const paymentId = getStringId(data, "paymentId");

  // 1. data.invoiceId: CUSTOMER /customer/invoices/{id}, ADMIN /admin/invoices/{id}
  if (invoiceId) {
    if (normalizedRole === "CUSTOMER") {
      return `/customer/invoices/${encodeURIComponent(invoiceId)}`;
    }
    if (normalizedRole === "ADMIN") {
      return `/admin/invoices/${encodeURIComponent(invoiceId)}`;
    }
    return null;
  }

  // 2. data.requestId: CUSTOMER /customer/requests/{id}, ADMIN /admin/dispatch/{id}
  if (requestId) {
    if (normalizedRole === "CUSTOMER") {
      return `/customer/requests/${encodeURIComponent(requestId)}`;
    }
    if (normalizedRole === "ADMIN") {
      return `/admin/dispatch/${encodeURIComponent(requestId)}`;
    }
    return null;
  }

  // 3. data.workOrderId: TECHNICIAN /technician/tasks/{id}, ADMIN /admin/work-orders/{id}, CUSTOMER /customer/jobs/{id}
  if (workOrderId) {
    if (normalizedRole === "TECHNICIAN") {
      return `/technician/tasks/${encodeURIComponent(workOrderId)}`;
    }
    if (normalizedRole === "ADMIN") {
      return `/admin/work-orders/${encodeURIComponent(workOrderId)}`;
    }
    if (normalizedRole === "CUSTOMER") {
      return `/customer/jobs/${encodeURIComponent(workOrderId)}`;
    }
    return null;
  }

  // 4. data.paymentId (no invoice): CUSTOMER /customer/payments, ADMIN /admin/payments
  if (paymentId) {
    if (normalizedRole === "CUSTOMER") {
      return "/customer/payments";
    }
    if (normalizedRole === "ADMIN") {
      return "/admin/payments";
    }
    return null;
  }

  // 5. type contains "SUBSCRIPTION": CUSTOMER /customer/premium
  if (upperType.includes("SUBSCRIPTION")) {
    if (normalizedRole === "CUSTOMER") {
      return "/customer/premium";
    }
    return null;
  }

  // 6. Otherwise null
  return null;
}
