/**
 * Transforms an enum/snake_case/SCREAMING_SNAKE_CASE string into a human-readable, sentence-cased label.
 * Example: "ROLE_CHANGED" -> "Role changed", "SERVICE_CATEGORY" -> "Service category"
 *
 * @param value - The raw string value.
 * @returns Formatted human-readable string or fallback "-".
 */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value || typeof value !== "string") {
    return "-";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "-";
  }

  // Replace underscores and hyphens with spaces
  const spaced = trimmed.replace(/[_-]+/g, " ").toLowerCase();

  // Capitalize only the first letter
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
