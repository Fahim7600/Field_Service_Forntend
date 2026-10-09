/**
 * Customer Change Policy Engine
 *
 * Rules Summary:
 * 1. Cancel/Reschedule is only possible BEFORE technician marks ARRIVED (APPROVED, ASSIGNED, SCHEDULED).
 *    Rescheduling specifically requires an existing visit time (SCHEDULED only).
 * 2. Active Premium members (status === "ACTIVE") change for free at any time before ARRIVED.
 * 3. Regular customers change for free if > 24 hours before visit (or no visit scheduled yet).
 * 4. Regular customers within <= 24 hours of visit incur an estimated late fee of $5.00 (500 cents).
 * 5. Unknown subscription state returns UNKNOWN kind with generic policy explanation.
 *
 * Examples:
 * - isPremium: true, status: "SCHEDULED", visitStart: in 2 hours -> FREE_PREMIUM ($0.00)
 * - isPremium: false, status: "SCHEDULED", visitStart: in 48 hours -> FREE_EARLY ($0.00)
 * - isPremium: false, status: "SCHEDULED", visitStart: in 6 hours -> LATE_FEE ($5.00)
 * - isPremium: false, status: "ASSIGNED", visitStart: null -> FREE_NO_VISIT ($0.00)
 * - isPremium: false, status: "ARRIVED", visitStart: in 0 hours -> NOT_ALLOWED ($0.00)
 * - isPremium: null, status: "SCHEDULED", visitStart: in 4 hours -> UNKNOWN ($0.00)
 */

import { differenceInHours } from "date-fns";
import { LATE_FEE_CENTS, LATE_FEE_WINDOW_HOURS } from "@/constants/policy";
import type { WorkOrderStatus } from "@/types/work-order";

export type ChangeEstimateKind =
  | "FREE_PREMIUM"
  | "FREE_EARLY"
  | "FREE_NO_VISIT"
  | "LATE_FEE"
  | "NOT_ALLOWED"
  | "UNKNOWN";

export interface ChangeEstimateInput {
  workOrderStatus?: WorkOrderStatus | string | null;
  visitStart?: string | Date | null;
  isPremium: boolean | null;
  now?: Date;
  action: "cancel" | "reschedule";
}

export interface ChangeEstimate {
  allowed: boolean;
  kind: ChangeEstimateKind;
  feeCents: number;
  message: string;
}

export function getChangeEstimate({
  workOrderStatus,
  visitStart,
  isPremium,
  now = new Date(),
  action,
}: ChangeEstimateInput): ChangeEstimate {
  const normStatus = String(workOrderStatus || "").toUpperCase();

  // 1. Statuses where changes are permanently locked
  const disallowedStatuses = [
    "ARRIVED",
    "IN_PROGRESS",
    "COMPLETED",
    "INVOICED",
    "PAID",
    "CLOSED",
    "CANCELLED",
    "REJECTED",
  ];

  if (disallowedStatuses.includes(normStatus)) {
    const isStarted = normStatus === "ARRIVED" || normStatus === "IN_PROGRESS";
    return {
      allowed: false,
      kind: "NOT_ALLOWED",
      feeCents: 0,
      message: isStarted
        ? "Work has already started on this job, so it can no longer be changed or cancelled."
        : "This job has ended or been cancelled and can no longer be modified.",
    };
  }

  // 2. Action-specific constraints
  if (action === "reschedule" && normStatus !== "SCHEDULED") {
    return {
      allowed: false,
      kind: "NOT_ALLOWED",
      feeCents: 0,
      message:
        "Rescheduling is only available for jobs with a confirmed scheduled visit.",
    };
  }

  // 3. Supported active pre-arrival statuses
  const allowedStatuses = ["APPROVED", "ASSIGNED", "SCHEDULED"];
  if (normStatus && !allowedStatuses.includes(normStatus)) {
    return {
      allowed: false,
      kind: "NOT_ALLOWED",
      feeCents: 0,
      message: "This job cannot be changed in its current status.",
    };
  }

  // 4. Premium Members (status === ACTIVE) change free before ARRIVED
  if (isPremium === true) {
    return {
      allowed: true,
      kind: "FREE_PREMIUM",
      feeCents: 0,
      message: "Free to change: active Premium membership benefit.",
    };
  }

  // 5. No visit scheduled yet (e.g. APPROVED or ASSIGNED without visitStart)
  if (!visitStart) {
    return {
      allowed: true,
      kind: "FREE_NO_VISIT",
      feeCents: 0,
      message:
        "Free to change: your visit appointment has not been scheduled yet.",
    };
  }

  const visitDate =
    typeof visitStart === "string" ? new Date(visitStart) : visitStart;
  if (Number.isNaN(visitDate.getTime())) {
    return {
      allowed: true,
      kind: "FREE_NO_VISIT",
      feeCents: 0,
      message: "Free to change: no confirmed visit window.",
    };
  }

  // 6. Calculate hours remaining until visit
  const hoursUntilVisit = differenceInHours(visitDate, now);

  if (hoursUntilVisit > LATE_FEE_WINDOW_HOURS) {
    return {
      allowed: true,
      kind: "FREE_EARLY",
      feeCents: 0,
      message: `Free: more than ${LATE_FEE_WINDOW_HOURS} hours before your scheduled visit.`,
    };
  }

  // 7. Within late fee window (<= 24 hours)
  if (isPremium === null) {
    return {
      allowed: true,
      kind: "UNKNOWN",
      feeCents: 0,
      message: `A late fee of $${(LATE_FEE_CENTS / 100).toFixed(2)} may apply if changed within ${LATE_FEE_WINDOW_HOURS} hours (free for active Premium members).`,
    };
  }

  return {
    allowed: true,
    kind: "LATE_FEE",
    feeCents: LATE_FEE_CENTS,
    message: `Estimated late fee: $${(LATE_FEE_CENTS / 100).toFixed(2)}. It will be added as an invoice you can pay online.`,
  };
}
