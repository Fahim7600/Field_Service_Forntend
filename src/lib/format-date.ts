import { format, isValid, parseISO } from "date-fns";

/**
 * Safely parses and formats a date string or Date object with date-fns.
 * Gracefully returns fallback string if the date is missing, null, or invalid.
 */
export function formatSafeDate(
  dateValue?: string | Date | null,
  formatStr = "MMM d, yyyy",
  fallback = "—",
): string {
  if (!dateValue) return fallback;
  try {
    const d =
      typeof dateValue === "string"
        ? parseISO(dateValue)
        : dateValue instanceof Date
          ? dateValue
          : new Date(dateValue);

    if (!isValid(d)) return fallback;
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}

/**
 * Safely formats date and time (e.g. "Oct 15, 2026 at 2:00 PM")
 */
export function formatSafeDateTime(
  dateValue?: string | Date | null,
  formatStr = "MMM d, yyyy 'at' h:mm a",
  fallback = "—",
): string {
  return formatSafeDate(dateValue, formatStr, fallback);
}
