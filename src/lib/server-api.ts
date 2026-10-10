import "server-only";
import { ApiError } from "@/lib/api-client";
import { getBackendUrl } from "@/lib/server-env";
import type { ApiResponse, FieldError } from "@/types/api";

export interface ServerFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Server-side data fetching helper for public endpoints.
 * Calls the backend API directly from Node.js runtime without browser proxy.
 */
export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const backendBase = getBackendUrl();

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const endpointPath = cleanPath.startsWith("/api/v1")
    ? cleanPath
    : `/api/v1${cleanPath}`;

  const fullUrl = new URL(endpointPath, backendBase);

  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    }
  }

  const { params: _params, ...fetchInit } = options;

  const response = await fetch(fullUrl.toString(), {
    ...fetchInit,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData:
      | { message?: string; errors?: string[] | FieldError[] }
      | undefined;
    try {
      errorData = (await response.json()) as {
        message?: string;
        errors?: string[] | FieldError[];
      };
    } catch {
      // Ignore JSON parse errors for non-JSON responses
    }

    const message =
      errorData?.message ||
      `Server fetch failed with status ${response.status}: ${response.statusText}`;

    throw new ApiError(message, response.status, errorData?.errors, errorData);
  }

  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}
