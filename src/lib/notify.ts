import {
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api-client";
import { authMessages } from "@/lib/auth-messages";

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
    return toast.error(title, {
      description,
      duration: options?.duration ?? DURATIONS.error,
      id: options?.id,
      icon: React.createElement(XCircle, { className: "size-4 text-rose-500" }),
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  fromError(error: unknown, fallbackTitle = "Error", options?: NotifyOptions) {
    const message = getErrorMessage(error);
    const id = options?.id ?? `err-${message}`;
    return toast.error(fallbackTitle, {
      description: message,
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

export { authMessages };
