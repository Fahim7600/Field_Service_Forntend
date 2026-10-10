/**
 * Validates and sanitizes internal application redirect paths to prevent
 * open redirect vulnerabilities.
 *
 * Requirements:
 * - Must start with a single "/"
 * - Must not start with "//"
 * - Must not contain "\\" (backslash)
 * - Must not contain "://"
 * - Must not contain control characters
 * - Must be strictly shorter than 500 characters
 */
export function getSafeRedirect(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();

  if (
    trimmed.length === 0 ||
    trimmed.length >= 500 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    trimmed.includes("://") ||
    // biome-ignore lint/suspicious/noControlCharactersInRegex: security check against ASCII control characters
    /[\x00-\x1F\x7F]/.test(trimmed)
  ) {
    return fallback;
  }

  return trimmed;
}
