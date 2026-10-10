import type { RequestsByStatusItem } from "@/types/admin";

const FIXED_STATUS_ORDER = [
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "ASSIGNED",
  "SCHEDULED",
  "ARRIVED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

/**
 * Normalizes various raw status counts shapes (object map or array) into a standardized array.
 * Validates entries strictly without any and sorts by fixed status order:
 * SUBMITTED -> APPROVED -> REJECTED -> others.
 */
export function normalizeRequestsByStatus(
  input: unknown,
): RequestsByStatusItem[] {
  if (!input || typeof input !== "object") {
    return [];
  }

  const itemsMap = new Map<string, number>();

  if (Array.isArray(input)) {
    for (const entry of input) {
      if (!entry || typeof entry !== "object") continue;
      const record = entry as Record<string, unknown>;
      const statusKey =
        typeof record.status === "string"
          ? record.status.trim()
          : typeof record.name === "string"
            ? record.name.trim()
            : typeof record.label === "string"
              ? record.label.trim()
              : "";
      const rawCount =
        typeof record.count === "number"
          ? record.count
          : typeof record.value === "number"
            ? record.value
            : typeof record.total === "number"
              ? record.total
              : Number(record.count ?? record.value ?? record.total);

      if (statusKey && Number.isFinite(rawCount) && rawCount >= 0) {
        itemsMap.set(statusKey, (itemsMap.get(statusKey) ?? 0) + rawCount);
      }
    }
  } else {
    for (const [key, value] of Object.entries(
      input as Record<string, unknown>,
    )) {
      const statusKey = key.trim();
      const rawCount = typeof value === "number" ? value : Number(value);

      if (statusKey && Number.isFinite(rawCount) && rawCount >= 0) {
        itemsMap.set(statusKey, (itemsMap.get(statusKey) ?? 0) + rawCount);
      }
    }
  }

  const result: RequestsByStatusItem[] = Array.from(itemsMap.entries()).map(
    ([status, count]) => ({ status, count }),
  );

  return result.sort((a, b) => {
    const idxA = FIXED_STATUS_ORDER.indexOf(a.status.toUpperCase());
    const idxB = FIXED_STATUS_ORDER.indexOf(b.status.toUpperCase());

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;

    return a.status.localeCompare(b.status);
  });
}

/**
 * Converts a raw fraction (0..1) or percentage (0..100) to a clean 0..100 percentage.
 * Clamps result between 0 and 100. Returns null for invalid or missing inputs.
 */
export function toPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;

  // Fraction between 0 and 1 (e.g. 0.94 -> 94)
  const converted = num <= 1 && num > 0 ? num * 100 : num;
  const clamped = Math.min(100, Math.max(0, converted));
  return Math.round(clamped * 10) / 10;
}

/**
 * Formats duration in minutes to a human-readable string ("45 min", "1 h 20 min", "2 h").
 * Returns "-" for invalid or negative inputs.
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "-";
  const num = Number(minutes);
  if (!Number.isFinite(num) || num <= 0) return "-";

  const totalMinutes = Math.round(num);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}
