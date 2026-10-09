/**
 * Maximum allowed amount in cents for invoice line items and totals ($100,000.00).
 */
export const MAX_ALLOWED_CENTS = 10_000_000;

/**
 * Parses a user input money string (e.g. "12", "12.5", "12.50", "1,200.00")
 * into an integer cents value without floating point inaccuracy.
 *
 * Rejects negative numbers, letters, more than 2 decimal places, or out-of-range amounts.
 *
 * @param input - The raw user input string.
 * @returns The integer cents value, or null if invalid.
 */
export function parseMoneyToCents(input: string): number | null {
  if (typeof input !== "string") return null;

  // Trim and strip currency symbols ($) and thousands separators (,)
  const trimmed = input.trim().replace(/^\$/, "").replace(/,/g, "").trim();
  if (!trimmed) return null;

  // Validate format: digits optionally followed by . and 1 or 2 digits
  // Disallows negative numbers, scientific notation, and letters
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }

  const parts = trimmed.split(".");
  const dollars = Number.parseInt(parts[0], 10);
  if (Number.isNaN(dollars)) return null;

  let cents = 0;
  if (parts.length === 2) {
    const decimalPart = parts[1];
    if (decimalPart.length === 1) {
      cents = Number.parseInt(decimalPart, 10) * 10;
    } else if (decimalPart.length === 2) {
      cents = Number.parseInt(decimalPart, 10);
    }
  }

  const totalCents = dollars * 100 + cents;

  if (totalCents < 0 || totalCents > MAX_ALLOWED_CENTS) {
    return null;
  }

  return totalCents;
}

/**
 * Converts an integer cents amount to a standard 2-decimal string suitable for input fields (e.g. 1999 -> "19.99").
 *
 * @param cents - Integer cents.
 * @returns Fixed 2-decimal string.
 */
export function centsToInputString(cents: number): string {
  if (typeof cents !== "number" || Number.isNaN(cents) || cents < 0) {
    return "0.00";
  }
  const dollars = Math.floor(cents / 100);
  const remainingCents = cents % 100;
  return `${dollars}.${remainingCents.toString().padStart(2, "0")}`;
}
