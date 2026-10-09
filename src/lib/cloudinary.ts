import axios from "axios";

export interface CloudinaryUploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Uploads an image file directly to Cloudinary using a dedicated, clean Axios instance.
 * Never includes Bearer tokens or default app interceptors.
 */
export async function uploadImageToCloudinary(
  file: File,
  options?: CloudinaryUploadOptions,
): Promise<string> {
  // 1. Validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `Unsupported file type "${file.type || "unknown"}". Allowed types: JPG, PNG, WEBP.`,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 5 MB limit.`,
    );
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Image upload is not configured");
  }

  // 2. Prepare payload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // 3. Dedicated clean Axios client without interceptors or auth headers
  const uploadClient = axios.create({
    withCredentials: false,
  });

  try {
    const response = await uploadClient.post<{ secure_url: string }>(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData,
      {
        signal: options?.signal,
        onUploadProgress: (progressEvent) => {
          if (options?.onProgress && progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            options.onProgress(Math.min(100, Math.max(0, percent)));
          }
        },
      },
    );

    if (!response.data?.secure_url) {
      throw new Error("Cloudinary response missing secure_url");
    }

    return response.data.secure_url;
  } catch (err: unknown) {
    if (axios.isCancel(err)) {
      throw new Error("Upload aborted");
    }

    if (axios.isAxiosError(err)) {
      const serverMsg = (err.response?.data as { error?: { message?: string } })
        ?.error?.message;
      throw new Error(serverMsg || err.message || "Failed to upload image");
    }

    if (err instanceof Error) {
      throw err;
    }

    throw new Error("Failed to upload image to Cloudinary");
  }
}
