import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { normalizePaginated } from "@/lib/extract-data";
import { clearSessionCookies } from "@/lib/session";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiResponse, FieldError, PaginatedResponse } from "@/types/api";
import type { RefreshTokenResponse } from "@/types/auth";

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: FieldError[] | string[];
  rawResponse?: unknown;

  constructor(
    message: string,
    status: number,
    fieldErrors?: FieldError[] | string[],
    rawResponse?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.rawResponse = rawResponse;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      errors?: string[] | FieldError[] | Record<string, string[]>;
      success?: boolean;
    }>;

    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message.includes("timeout")
    ) {
      return "Request timed out. Please check your connection and try again.";
    }

    if (!axiosError.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    const data = axiosError.response.data;
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === "string") return first;
      if (typeof first === "object" && first && "message" in first) {
        return String(first.message);
      }
    }

    switch (axiosError.response.status) {
      case 400:
        return "Invalid request payload. Please check your inputs.";
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "A conflict occurred with an existing resource.";
      case 422:
        return "Validation failed. Please verify your data.";
      case 429:
        return "Too many requests. Please slow down and try again later.";
      case 500:
      case 502:
      case 503:
        return "Server error occurred. Please try again shortly.";
      default:
        return `Request failed with status ${axiosError.response.status}.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE || "/api/v1";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 60000,
});

// Request interceptor: add bearer token from memory Zustand store
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Single shared in-flight refresh promise
let refreshPromise: Promise<string | null> | null = null;

const AUTH_BYPASS_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
  "/auth/google",
  "/auth/google/callback",
];

function isAuthBypassEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_BYPASS_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

// Response interceptor: handle 401 silent token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const is401 = error.response.status === 401;
    const isBypass = isAuthBypassEndpoint(originalRequest.url);
    const alreadyRetried = Boolean(originalRequest._retry);

    if (is401 && !alreadyRetried && !isBypass) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = (async () => {
            try {
              // Direct refresh request to backend endpoint via proxy
              const res = await axios.post<ApiResponse<RefreshTokenResponse>>(
                `${baseURL}/auth/refresh-token`,
                {},
                { withCredentials: true, timeout: 15000 },
              );

              const newToken = res.data?.data?.accessToken;
              if (newToken) {
                useAuthStore.getState().setAccessToken(newToken);
                return newToken;
              }
              return null;
            } catch {
              useAuthStore.getState().logout();
              try {
                await clearSessionCookies();
              } catch {
                // Ignore cookie clearing error
              }
              if (
                typeof window !== "undefined" &&
                (window.location.pathname.startsWith("/admin") ||
                  window.location.pathname.startsWith("/customer") ||
                  window.location.pathname.startsWith("/technician") ||
                  window.location.pathname.startsWith("/dashboard"))
              ) {
                window.location.assign("/login");
              }
              return null;
            } finally {
              refreshPromise = null;
            }
          })();
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshCatchErr) {
        return Promise.reject(refreshCatchErr);
      }
    }

    // Convert axios error response to ApiError
    const responseData = error.response.data as
      | {
          message?: string;
          errors?: string[] | FieldError[];
        }
      | undefined;

    const message = responseData?.message || getErrorMessage(error);
    const apiError = new ApiError(
      message,
      error.response.status,
      responseData?.errors,
      error.response.data,
    );

    return Promise.reject(apiError);
  },
);

// Typed Helper Functions
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  data?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiPatch<T, B = unknown>(
  url: string,
  data?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  data?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function apiGetPaginated<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<PaginatedResponse<T>> {
  const response = await apiClient.get<unknown>(url, config);
  return normalizePaginated<T>(response.data);
}

export async function apiPostForm<T>(
  url: string,
  formData: FormData,
  options?: {
    onUploadProgress?: (percent: number) => void;
    signal?: AbortSignal;
  },
): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: {
      "Content-Type": undefined,
    },
    signal: options?.signal,
    onUploadProgress: (progressEvent) => {
      if (options?.onUploadProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        options.onUploadProgress(Math.min(100, Math.max(0, percent)));
      }
    },
  });
  return response.data.data;
}
