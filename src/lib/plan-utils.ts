import type { PlanInterval } from "@/types/subscription";

/**
 * Calculates yearly savings in cents and whole percentage compared to 12 months of monthly billing.
 * Both values are guaranteed to never be negative.
 */
export function getYearlySavings(
  monthlyCents: number,
  yearlyCents: number,
): { savingsCents: number; percent: number } {
  const annualizedMonthly = monthlyCents * 12;
  const savingsCents = Math.max(0, annualizedMonthly - yearlyCents);
  const percent =
    annualizedMonthly > 0
      ? Math.max(0, Math.round((savingsCents / annualizedMonthly) * 100))
      : 0;

  return { savingsCents, percent };
}

/**
 * Formats a subscription interval string into a user-friendly lowercase singular noun.
 */
export function formatInterval(
  interval: PlanInterval | string | undefined | null,
): "month" | "year" {
  if (!interval) return "month";
  const normalized = interval.trim().toUpperCase();
  if (
    normalized === "YEAR" ||
    normalized === "ANNUAL" ||
    normalized === "YEARLY"
  ) {
    return "year";
  }
  return "month";
}
