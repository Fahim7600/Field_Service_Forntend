"use client";

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { normalizeError } from "@/lib/notify";
import { cn } from "@/lib/utils";

export interface QueryErrorProps {
  error: unknown;
  onRetry?: () => unknown;
  title?: string;
  compact?: boolean;
  className?: string;
}

export function getFriendlyError(error: unknown): {
  title: string;
  description: string;
  isNetworkOrTimeout: boolean;
} {
  const normalized = normalizeError(error);
  const title = normalized?.title ?? "Failed to load data";
  const description =
    normalized?.description ??
    "An unexpected error occurred while fetching information.";

  const isNetworkOrTimeout =
    description.toLowerCase().includes("connection") ||
    description.toLowerCase().includes("waking up") ||
    description.toLowerCase().includes("timeout") ||
    description.toLowerCase().includes("network") ||
    description.toLowerCase().includes("offline");

  return { title, description, isNetworkOrTimeout };
}

export function QueryError({
  error,
  onRetry,
  title: customTitle,
  compact = false,
  className,
}: QueryErrorProps) {
  const [retrying, setRetrying] = useState(false);
  const { title, description, isNetworkOrTimeout } = getFriendlyError(error);

  const displayTitle = customTitle ?? title;

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3.5 rounded-lg border border-destructive/20 bg-destructive/5 text-destructive text-sm",
          className,
        )}
        role="alert"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertCircle className="size-4 shrink-0 text-destructive" />
          <span className="truncate text-xs font-medium text-charcoal-800">
            {description}
          </span>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={retrying}
            className="h-7 px-2.5 text-xs shrink-0 border-destructive/30 hover:bg-destructive/10 text-destructive"
          >
            {retrying ? (
              <Loader2 className="size-3 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="size-3 mr-1.5" />
            )}
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-xl border border-border bg-panel/60 shadow-xs",
        className,
      )}
      role="alert"
    >
      <div className="size-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-xs">
        <AlertCircle className="size-6 text-destructive" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-charcoal-900 mb-1">
        {displayTitle}
      </h3>

      <p className="text-sm text-charcoal-600 max-w-md mb-2 leading-relaxed">
        {description}
      </p>

      {isNetworkOrTimeout && (
        <p className="text-xs text-charcoal-500 mb-5 max-w-sm">
          The server may be waking up. This can take up to a minute.
        </p>
      )}

      {onRetry && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={retrying}
            className="shadow-xs font-medium"
          >
            {retrying ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="size-4 mr-2" />
                Retry
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
