"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Crown,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { safeFormatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CustomerMembershipCard() {
  const { isPremium, subscription, status, isLoading, isUnknown, refetch } =
    usePremiumStatus();

  if (isLoading) {
    return <Skeleton className="h-44 w-full rounded-xl" />;
  }

  if (isUnknown) {
    return (
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-bold text-foreground">
              Membership Status
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Unable to load your current membership status.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <RefreshCw className="size-3" />
            <span>Retry</span>
          </button>
        </CardContent>
      </Card>
    );
  }

  if (status === "PAST_DUE") {
    return (
      <Card className="border border-amber-500/40 bg-amber-500/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-foreground">
                Membership
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold"
            >
              PAST DUE
            </Badge>
          </div>
          <CardDescription className="text-xs text-amber-800 dark:text-amber-300">
            Your last renewal payment failed. Benefits are temporarily paused.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Link
            href="/customer/premium"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-8 text-xs font-semibold border-amber-500/40 hover:bg-amber-500/10",
            )}
          >
            <span>Fix Payment &amp; Manage</span>
            <ArrowRight className="size-3.5 ml-1" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (isPremium && subscription) {
    const isCancelAtPeriodEnd = subscription.cancelAtPeriodEnd;

    return (
      <Card className="border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="size-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm font-bold text-foreground">
                Membership Plan
              </CardTitle>
            </div>
            <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
              ACTIVE
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {subscription.plan?.name || "Premium Plan"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3 text-xs">
          <div className="text-muted-foreground">
            {isCancelAtPeriodEnd ? (
              <span className="text-amber-700 dark:text-amber-400">
                Renewal cancelled. Benefits active until{" "}
                <strong className="font-semibold text-foreground">
                  {safeFormatDate(subscription.currentPeriodEnd)}
                </strong>
                .
              </span>
            ) : (
              <span>
                Renews automatically on{" "}
                <strong className="font-semibold text-foreground">
                  {safeFormatDate(subscription.currentPeriodEnd)}
                </strong>
                .
              </span>
            )}
          </div>
          <div>
            <Link
              href="/customer/premium"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 text-xs font-semibold",
              )}
            >
              <span>Manage membership</span>
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Free Plan / No Subscription
  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-bold text-foreground">
              Membership Plan
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-muted-foreground text-[10px] font-semibold"
          >
            Free Plan
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Standard turnaround queue and regular labor rates.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link
          href="/customer/premium"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "h-8 text-xs font-semibold",
          )}
        >
          <Sparkles className="size-3.5 mr-1" />
          <span>See Premium</span>
        </Link>
      </CardContent>
    </Card>
  );
}
