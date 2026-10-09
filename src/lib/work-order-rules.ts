import type { WorkOrderStatus } from "@/types/work-order";

export type TechnicianActionType =
  | "RESPOND"
  | "AWAIT_SCHEDULE"
  | "MARK_ARRIVED"
  | "START_WORK"
  | "FILE_REPORT"
  | "NONE";

/**
 * Checks if a task has been accepted by the technician.
 * Returns true if accepted, false if not accepted, or null if unknown/not exposed.
 */
export function isAccepted(
  task: { acceptedAt?: string | null } | null | undefined,
): boolean | null {
  if (!task || task.acceptedAt === undefined) {
    return null;
  }
  if (
    typeof task.acceptedAt === "string" &&
    task.acceptedAt.trim().length > 0
  ) {
    return true;
  }
  return false;
}

/**
 * Pure state-machine evaluation determining what action is currently valid for the technician.
 */
export function getTechnicianActions(
  task:
    | {
        status?: WorkOrderStatus | string | null;
        acceptedAt?: string | null;
      }
    | null
    | undefined,
): TechnicianActionType {
  if (!task || !task.status) return "NONE";

  const status = String(task.status).toUpperCase();

  switch (status) {
    case "ASSIGNED": {
      const accepted = isAccepted(task);
      if (accepted === true) {
        return "AWAIT_SCHEDULE";
      }
      return "RESPOND";
    }

    case "SCHEDULED":
      return "MARK_ARRIVED";

    case "ARRIVED":
      return "START_WORK";

    case "IN_PROGRESS":
      return "FILE_REPORT";

    default:
      return "NONE";
  }
}

/**
 * Next status step map for technician transitions.
 */
export const NEXT_STATUS = {
  SCHEDULED: "ARRIVED",
  ARRIVED: "IN_PROGRESS",
} as const;
