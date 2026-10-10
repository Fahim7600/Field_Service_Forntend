"use client";

import {
  CheckCircle2,
  Info,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ theme = "light", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      position="top-right"
      richColors
      closeButton
      visibleToasts={3}
      offset="20px"
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-500" />,
        info: <Info className="size-4 text-blue-500" />,
        warning: <TriangleAlert className="size-4 text-amber-500" />,
        error: <XCircle className="size-4 text-rose-500" />,
        loading: <Loader2 className="size-4 animate-spin text-charcoal-500" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-charcoal-900 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:border font-sans",
          description: "group-[.toast]:text-charcoal-600 text-xs mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs",
          closeButton:
            "group-[.toast]:bg-card group-[.toast]:border-border group-[.toast]:text-charcoal-600 hover:group-[.toast]:text-charcoal-900",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
