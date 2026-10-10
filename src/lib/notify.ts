import axios from "axios";
import {
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { authMessages } from "@/lib/auth-messages";
import { messages } from "@/lib/messages";

export interface NotifyAction {
  label: string;
  onClick: () => void;
}

export interface NotifyOptions {
  id?: string | number;
  duration?: number;
  action?: NotifyAction;
}

const DURATIONS = {
  success: 4000,
  info: 4500,
  warning: 5500,
  error: 6000,
} as const;

export function normalizeError(error: unknown): {
  title: string;
  description: string;
  status?: number;
} | null {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return null; // Session layer handles it, do not toast
    }
    if (error.status === 403) {
      return {
        title: messages.generic.forbidden.title,
        description: messages.generic.forbidden.description,
        status: 403,
      };
    }
    if (error.status === 404) {
      return {
        title: messages.generic.notFound.title,
        description: messages.generic.notFound.description,
        status: 404,
      };
    }
    if (error.status === 409) {
      return {
        title: "Action conflict",
        description: error.message || "A conflicting record already exists.",
        status: 409,
      };
    }
    if (error.status === 429) {
      return {
        title: "Too many attempts",
        description: "Please wait a moment before trying again.",
        status: 429,
      };
    }
    if (error.status >= 500) {
      return {
        title: "Server error",
        description: "Something went wrong on our side. Please try again.",
        status: error.status,
      };
    }
    return {
      title: "Action failed",
      description: error.message || "Please check your inputs and try again.",
      status: error.status,
    };
  }

  if (axios.isAxiosError(error)) {
    if (
      error.code === "ECONNABORTED" ||
      error.message?.includes("timeout") ||
      !error.response
    ) {
      return {
        title: messages.generic.networkProblem.title,
        description: messages.generic.networkProblem.description,
      };
    }
    const status = error.response.status;
    if (status === 401) return null;
    if (status === 403) {
      return {
        title: messages.generic.forbidden.title,
        description: messages.generic.forbidden.description,
        status: 403,
      };
    }
    if (status === 404) {
      return {
        title: messages.generic.notFound.title,
        description: messages.generic.notFound.description,
        status: 404,
      };
    }
    if (status === 429) {
      return {
        title: "Too many attempts",
        description: "Please wait a moment before trying again.",
        status: 429,
      };
    }
    if (status >= 500) {
      return {
        title: "Server error",
        description: "Something went wrong on our side. Please try again.",
        status,
      };
    }
    const apiMsg = getErrorMessage(error);
    return { title: "Action failed", description: apiMsg, status };
  }

  if (error instanceof Error) {
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    ) {
      return {
        title: messages.generic.networkProblem.title,
        description: messages.generic.networkProblem.description,
      };
    }
    return { title: "Action failed", description: error.message };
  }

  return {
    title: "Action failed",
    description: "An unexpected error occurred. Please try again.",
  };
}

export const notify = {
  success(title: string, description?: string, options?: NotifyOptions) {
    return toast.success(title, {
      description,
      duration: options?.duration ?? DURATIONS.success,
      id: options?.id,
      icon: React.createElement(CheckCircle2, {
        className: "size-4 text-emerald-500",
      }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  info(title: string, description?: string, options?: NotifyOptions) {
    return toast.info(title, {
      description,
      duration: options?.duration ?? DURATIONS.info,
      id: options?.id,
      icon: React.createElement(Info, { className: "size-4 text-blue-500" }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  warning(title: string, description?: string, options?: NotifyOptions) {
    return toast.warning(title, {
      description,
      duration: options?.duration ?? DURATIONS.warning,
      id: options?.id,
      icon: React.createElement(TriangleAlert, {
        className: "size-4 text-amber-500",
      }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  error(title: string, description?: string, options?: NotifyOptions) {
    const id = options?.id ?? `err-${title}-${description || ""}`;
    return toast.error(title, {
      description,
      duration: options?.duration ?? DURATIONS.error,
      id,
      icon: React.createElement(XCircle, { className: "size-4 text-rose-500" }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  fromError(error: unknown, fallbackTitle?: string, options?: NotifyOptions) {
    const normalized = normalizeError(error);
    if (!normalized) {
      return; // 401 error or suppressed
    }

    const title = fallbackTitle ?? normalized.title;
    const description = normalized.description;
    const id = options?.id ?? `err-${title}-${description}`;

    return toast.error(title, {
      description,
      duration: options?.duration ?? DURATIONS.error,
      id,
      icon: React.createElement(XCircle, { className: "size-4 text-rose-500" }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  loading(
    title: string,
    description?: string,
    options?: NotifyOptions,
  ): string | number {
    return toast.loading(title, {
      description,
      duration: options?.duration ?? Number.POSITIVE_INFINITY,
      id: options?.id,
      icon: React.createElement(Loader2, {
        className: "size-4 animate-spin text-charcoal-500",
      }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },
};

export { authMessages, messages };
