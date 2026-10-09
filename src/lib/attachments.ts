/**
 * Safely extracts a displayable URL string from an attachment item,
 * supporting legacy URL strings, OpenAPI binary attachment objects ({ id, fileUrl }),
 * or custom attachment shapes ({ url, previewUrl }).
 * Returns null if no usable URL is present.
 */
export function getAttachmentUrl(item: unknown): string | null {
  if (!item) return null;

  if (typeof item === "string") {
    const trimmed = item.trim();
    if (
      trimmed.startsWith("http://") ||
      trimmed.startsWith("https://") ||
      trimmed.startsWith("blob:") ||
      trimmed.startsWith("/")
    ) {
      return trimmed;
    }
    return null;
  }

  if (typeof item === "object" && item !== null) {
    const obj = item as Record<string, unknown>;

    if (typeof obj.fileUrl === "string" && obj.fileUrl.trim()) {
      return obj.fileUrl.trim();
    }

    if (typeof obj.url === "string" && obj.url.trim()) {
      return obj.url.trim();
    }

    if (typeof obj.previewUrl === "string" && obj.previewUrl.trim()) {
      return obj.previewUrl.trim();
    }
  }

  return null;
}
