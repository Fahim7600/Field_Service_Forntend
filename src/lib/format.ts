import {
  format,
  formatDistanceToNowStrict,
  isPast as isPastDateFns,
  isValid,
  parseISO,
} from "date-fns";

/**
 * Formats an amount in cents into localized currency (e.g., 15000 -> "$150.00").
 * Returns "-" if value is null, undefined, or NaN.
 */
export function formatMoney(
  cents: number | null | undefined,
  currency = "USD",
): string {
  if (cents === null || cents === undefined) {
    return "-";
  }

  const num = Number(cents);
  if (Number.isNaN(num)) {
    return "-";
  }

  const dollars = num / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(dollars);
  } catch {
    return `$${dollars.toFixed(2)}`;
  }
}

/**
 * Safely parses any date string or Date object into a valid Date, or null if invalid.
 */
export function parseSafeDate(
  value: string | Date | null | undefined,
): Date | null {
  if (!value) return null;
  try {
    const parsed =
      typeof value === "string"
        ? parseISO(value)
        : value instanceof Date
          ? value
          : new Date(value);

    if (!isValid(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Safely formats date using date-fns. Never throws; returns fallback on failure.
 * Default pattern: "dd MMM yyyy"
 */
export function safeFormatDate(
  value: string | Date | null | undefined,
  pattern = "dd MMM yyyy",
  fallback = "-",
): string {
  const d = parseSafeDate(value);
  if (!d) return fallback;
  try {
    return format(d, pattern);
  } catch {
    return fallback;
  }
}

/**
 * Safely formats date and time.
 * Pattern: "dd MMM yyyy, hh:mm a"
 */
export function safeFormatDateTime(
  value: string | Date | null | undefined,
  fallback = "-",
): string {
  return safeFormatDate(value, "dd MMM yyyy, hh:mm a", fallback);
}

/**
 * Formats date relative to now (e.g. "in 2 hours", "3 hours ago").
 * Returns fallback "-" on null or invalid date.
 */
export function formatRelative(
  value: string | Date | null | undefined,
  fallback = "-",
): string {
  const d = parseSafeDate(value);
  if (!d) return fallback;
  try {
    return formatDistanceToNowStrict(d, { addSuffix: true });
  } catch {
    return fallback;
  }
}

/**
 * Safely checks if a date value is in the past.
 * Returns false for null/undefined/invalid dates.
 */
export function isPast(value: string | Date | null | undefined): boolean {
  const d = parseSafeDate(value);
  if (!d) return false;
  try {
    return isPastDateFns(d);
  } catch {
    return false;
  }
}

/**
 * Converts a datetime-local input string ("2026-10-12T10:30") to a UTC ISO string.
 * Returns null if input is invalid.
 */
export function toIsoFromLocalInput(localValue: string): string | null {
  if (!localValue || typeof localValue !== "string") return null;
  try {
    const date = new Date(localValue);
    if (!isValid(date)) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Converts a UTC ISO string to "YYYY-MM-DDTHH:mm" suitable for <input type="datetime-local">.
 * Returns empty string if invalid or missing.
 */
export function toLocalInputValue(iso: string | null | undefined): string {
  const d = parseSafeDate(iso);
  if (!d) return "";
  try {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
}

// Backwards compatibility aliases
export const formatSafeDate = safeFormatDate;
export const formatSafeDateTime = safeFormatDateTime;
export const formatCurrencyCents = (
  cents?: number | null,
  currency = "USD",
) => {
  const formatted = formatMoney(cents, currency);
  return formatted === "-" ? "$0.00" : formatted;
};
