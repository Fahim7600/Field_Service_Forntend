export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/**
 * Validates a single image file for allowed MIME types and file size limit.
 * Returns a friendly human-readable error message, or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!file) {
    return "No file provided.";
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(file.type as AllowedImageType) &&
    !file.type.startsWith("image/")
  ) {
    return `"${file.name}" is not an accepted image type. Please select a JPG, PNG, or WEBP image.`;
  }

  if (file.size > IMAGE_MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `"${file.name}" is ${sizeMb} MB, which exceeds the 5 MB limit.`;
  }

  return null;
}

/**
 * Appends an array of files under a specified field name to a FormData instance.
 */
export function appendFiles(
  formData: FormData,
  fieldName: string,
  files: (File | Blob)[],
): void {
  for (const file of files) {
    formData.append(fieldName, file);
  }
}
