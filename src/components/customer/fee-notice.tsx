"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Crown,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ChangeEstimate } from "@/lib/change-policy";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface FeeNoticeProps {
  estimate: ChangeEstimate;
  className?: string;
  isPremium?: boolean | null;
}

export function FeeNotice({ estimate, className, isPremium }: FeeNoticeProps) {
  const showPremiumUpsell =
    isPremium !== true && estimate.kind !== "NOT_ALLOWED";

  if (
    estimate.kind === "FREE_PREMIUM" ||
    estimate.kind === "FREE_EARLY" ||
    estimate.kind === "FREE_NO_VISIT"
  ) {
    return (
      <div className={cn("space-y-2", className)}>
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300">
          {estimate.kind === "FREE_PREMIUM" ? (
            <Crown className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <div className="space-y-0.5">
            <AlertTitle className="text-xs font-bold">
              {estimate.kind === "FREE_PREMIUM"
                ? "Free to change: Premium Benefit"
                : "No Change Fee"}
            </AlertTitle>
            <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
              {estimate.message}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  if (estimate.kind === "LATE_FEE") {
    return (
      <div className={cn("space-y-2", className)}>
        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="space-y-1">
            <AlertTitle className="text-xs font-bold flex items-center gap-1.5">
              <span>Estimated Late Fee:</span>
              <span className="font-mono text-amber-700 dark:text-amber-300 underline font-semibold">
                {formatMoney(estimate.feeCents)}
              </span>
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
              {estimate.message}
            </AlertDescription>
            {showPremiumUpsell && (
              <div className="pt-1">
                <Link
                  href="/customer/premium"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:underline"
                >
                  <Crown className="size-3 text-amber-600 dark:text-amber-400" />
                  <span>Premium members change plans for free →</span>
                </Link>
              </div>
            )}
          </div>
        </Alert>
      </div>
    );
  }

  if (estimate.kind === "NOT_ALLOWED") {
    return (
      <div className={cn("space-y-2", className)}>
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10"
        >
          <AlertCircle className="size-4 shrink-0" />
          <div className="space-y-0.5">
            <AlertTitle className="text-xs font-bold">
              Modification Unavailable
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              {estimate.message}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  // UNKNOWN kind
  return (
    <div className={cn("space-y-2", className)}>
      <Alert className="border-border bg-muted/50 text-foreground">
        <HelpCircle className="size-4 text-muted-foreground shrink-0" />
        <div className="space-y-1">
          <AlertTitle className="text-xs font-bold">
            Cancellation &amp; Reschedule Policy
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground leading-relaxed">
            {estimate.message}
          </AlertDescription>
          {showPremiumUpsell && (
            <div className="pt-1">
              <Link
                href="/customer/premium"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                <Crown className="size-3 text-brand-600" />
                <span>Premium members change plans for free →</span>
              </Link>
            </div>
          )}
        </div>
      </Alert>
    </div>
  );
}
