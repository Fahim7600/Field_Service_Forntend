import { isValid, parseISO } from "date-fns";
import type { TechnicianTask } from "@/types/api";

export interface StatusCountItem {
  status: string;
  count: number;
}

export interface TechnicianPerformanceStats {
  countsByStatus: StatusCountItem[];
  completedCount: number;
  activeCount: number;
  cancelledCount: number;
  upcomingVisits: TechnicianTask[];
  hoursLogged: number | null;
  recentCompleted: TechnicianTask[];
  isTruncated: boolean;
}

const LIFECYCLE_ORDER = [
  "ASSIGNED",
  "SCHEDULED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "INVOICED",
  "PAID",
  "CLOSED",
  "CANCELLED",
];

const COMPLETED_FAMILY = new Set(["COMPLETED", "INVOICED", "PAID", "CLOSED"]);

const ACTIVE_FAMILY = new Set([
  "ASSIGNED",
  "SCHEDULED",
  "ARRIVED",
  "IN_PROGRESS",
]);

function parseSafeIso(value: unknown): Date | null {
  if (!value || typeof value !== "string") return null;
  try {
    const parsed = parseISO(value);
    if (!isValid(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Computes performance analytics from assigned work orders for the authenticated technician.
 * Handles missing fields, nulls, and unknown statuses safely without throwing.
 */
export function computeTechnicianStats(
  items: unknown,
  total: number | null | undefined,
): TechnicianPerformanceStats {
  const tasks: TechnicianTask[] = Array.isArray(items)
    ? (items as TechnicianTask[])
    : [];
  const now = new Date();

  const statusMap = new Map<string, number>();
  let completedCount = 0;
  let activeCount = 0;
  let cancelledCount = 0;
  let hoursTotal = 0;
  let hasAnyHoursReported = false;

  const upcomingCandidates: Array<{ task: TechnicianTask; date: Date }> = [];
  const completedCandidates: Array<{ task: TechnicianTask; dateMs: number }> =
    [];

  for (const task of tasks) {
    if (!task || typeof task !== "object") continue;

    const rawStatus =
      typeof task.status === "string"
        ? task.status.trim().toUpperCase()
        : "UNKNOWN";
    statusMap.set(rawStatus, (statusMap.get(rawStatus) ?? 0) + 1);

    if (COMPLETED_FAMILY.has(rawStatus)) {
      completedCount++;
      // Determine best date for sorting completed jobs
      const compDate =
        parseSafeIso(task.updatedAt) ||
        parseSafeIso(task.visitEnd) ||
        parseSafeIso(task.visitStart) ||
        parseSafeIso(task.createdAt);
      completedCandidates.push({
        task,
        dateMs: compDate ? compDate.getTime() : 0,
      });
    } else if (ACTIVE_FAMILY.has(rawStatus)) {
      activeCount++;
    } else if (rawStatus === "CANCELLED") {
      cancelledCount++;
    }

    // Check upcoming visits for SCHEDULED tasks with future visitStart
    if (rawStatus === "SCHEDULED") {
      const visitDate =
        parseSafeIso(task.visitStart) || parseSafeIso(task.scheduledDate);
      if (visitDate && visitDate.getTime() > now.getTime()) {
        upcomingCandidates.push({ task, date: visitDate });
      }
    }

    // Accumulate hours spent if report exists
    if (
      task.serviceReport &&
      typeof task.serviceReport.hoursSpent === "number"
    ) {
      const hours = Number(task.serviceReport.hoursSpent);
      if (Number.isFinite(hours) && hours >= 0) {
        hoursTotal += hours;
        hasAnyHoursReported = true;
      }
    }
  }

  // Sort counts by lifecycle order
  const countsByStatus: StatusCountItem[] = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => {
      const idxA = LIFECYCLE_ORDER.indexOf(a.status);
      const idxB = LIFECYCLE_ORDER.indexOf(b.status);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.status.localeCompare(b.status);
    });

  // Sort upcoming visits ascending (soonest first)
  upcomingCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcomingVisits = upcomingCandidates.map((c) => c.task);

  // Sort recent completed jobs descending (most recent first)
  completedCandidates.sort((a, b) => b.dateMs - a.dateMs);
  const recentCompleted = completedCandidates.slice(0, 5).map((c) => c.task);

  const isTruncated =
    typeof total === "number" && total > 0 ? total > tasks.length : false;

  return {
    countsByStatus,
    completedCount,
    activeCount,
    cancelledCount,
    upcomingVisits,
    hoursLogged: hasAnyHoursReported ? Math.round(hoursTotal * 10) / 10 : null,
    recentCompleted,
    isTruncated,
  };
}
