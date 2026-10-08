/**
 * Safely formats amounts in cents into localized USD currency format.
 * E.g., 15000 cents -> "$150.00"
 */
export function formatCurrencyCents(
  cents?: number | null,
  currency = "USD",
): string {
  if (cents === null || cents === undefined || Number.isNaN(Number(cents))) {
    return "$0.00";
  }

  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(dollars);
}
