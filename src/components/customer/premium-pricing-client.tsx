"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Crown,
  Info,
  Loader2,
  Minus,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLAN_COMPARISON_FEATURES,
  PREMIUM_BENEFITS,
} from "@/constants/premium";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { formatMoney, safeFormatDate } from "@/lib/format";
import { formatInterval, getYearlySavings } from "@/lib/plan-utils";
import { isSafeCheckoutUrl, redirectToCheckout } from "@/lib/stripe-redirect";
import { cn } from "@/lib/utils";
import { subscriptionsService } from "@/services/subscriptions.service";
import type { SubscriptionPlan } from "@/types/subscription";

export function PremiumPricingClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const {
    isPremium,
    subscription,
    status: subStatus,
    isLoading: isSubLoading,
    isUnknown,
    refetch: refetchSub,
  } = usePremiumStatus();

  // Return query parameters from Stripe redirect
  const [returnStatus, setReturnStatus] = React.useState<
    "success" | "cancelled" | "timeout" | null
  >(null);
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(
    null,
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  // Read return params once on mount and clean the URL
  React.useEffect(() => {
    const checkoutParam = searchParams.get("checkout");
    if (checkoutParam === "success") {
      setReturnStatus("success");
      router.replace(pathname, { scroll: false });
    } else if (checkoutParam === "cancelled") {
      setReturnStatus("cancelled");
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Listen to browser pageshow for back-forward cache restoration
  React.useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setSelectedPlanId(null);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Poll for subscription activation when Stripe checkout returns success
  React.useEffect(() => {
    if (returnStatus !== "success") return;

    let attempts = 0;
    const maxAttempts = 22; // ~44-45 seconds at 2s interval
    let isCancelled = false;

    const intervalId = window.setInterval(async () => {
      if (isCancelled) return;
      attempts += 1;

      try {
        const current = await subscriptionsService.fetchMySubscription();
        if (current && current.status === "ACTIVE") {
          window.clearInterval(intervalId);
          setReturnStatus(null);
          toast.success("Welcome to Premium", {
            description: "Your benefits are now active.",
          });
          queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
          return;
        }
      } catch {
        // Continue polling silently
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
        setReturnStatus("timeout");
      }
    }, 2000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [returnStatus, queryClient]);

  // Fetch available subscription plans
  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isError: isPlansError,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionsService.fetchPlans(),
    staleTime: 60_000,
  });

  // Stripe Checkout Initiation Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      setSelectedPlanId(planId);
      return subscriptionsService.startCheckout(planId);
    },
    onSuccess: (data) => {
      if (isSafeCheckoutUrl(data.url)) {
        toast.info("Redirecting to secure Stripe Checkout...");
        redirectToCheckout(data.url);
      } else {
        setSelectedPlanId(null);
        toast.error("Could not start checkout", {
          description: "Invalid checkout redirect URL received from server.",
        });
      }
    },
    onError: (err: unknown) => {
      setSelectedPlanId(null);
      const isConflict =
        (err instanceof ApiError && err.status === 409) ||
        (axios.isAxiosError(err) && err.response?.status === 409) ||
        getErrorMessage(err).toLowerCase().includes("already subscribed");

      if (isConflict) {
        toast.error(getErrorMessage(err));
        refetchSub();
      } else {
        toast.error("Could not start checkout", {
          description: getErrorMessage(err),
        });
      }
    },
  });

  // Cancel Renewal Mutation
  const cancelRenewalMutation = useMutation({
    mutationFn: () => subscriptionsService.cancelRenewal(),
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      toast.success("Renewal cancelled", {
        description:
          "You keep all Premium benefits until the end of your current period.",
      });
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      refetchSub();
    },
    onError: (err: unknown) => {
      toast.error("Failed to cancel renewal", {
        description: getErrorMessage(err),
      });
    },
  });

  // Monthly and yearly plans for savings computation
  const monthlyPlan = plans.find((p) => formatInterval(p.interval) === "month");
  const yearlyPlan = plans.find((p) => formatInterval(p.interval) === "year");

  let yearlySavingsPercent = 0;
  if (monthlyPlan && yearlyPlan) {
    const { percent } = getYearlySavings(
      monthlyPlan.priceCents,
      yearlyPlan.priceCents,
    );
    yearlySavingsPercent = percent;
  }

  // Skeletons during initial load
  if (isSubLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Return Status Banners */}
      {returnStatus === "success" && (
        <Alert className="border-brand-500/30 bg-brand-50/50 dark:bg-brand-950/20 text-brand-950 dark:text-brand-200">
          <Loader2 className="size-4 animate-spin text-brand-600 dark:text-brand-400" />
          <AlertTitle className="font-semibold text-sm">
            Payment received
          </AlertTitle>
          <AlertDescription className="text-xs pt-1">
            Activating your premium membership... Please wait while your status
            is updated.
          </AlertDescription>
        </Alert>
      )}

      {returnStatus === "timeout" && (
        <Alert className="border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold text-sm">
            Activation in progress
          </AlertTitle>
          <AlertDescription className="text-xs pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              Still activating. This can take a minute. You will not be charged
              twice.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setReturnStatus("success");
                refetchSub();
              }}
              className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/20 shrink-0"
            >
              <RefreshCw className="size-3 mr-1" />
              Check again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {returnStatus === "cancelled" && (
        <Alert className="border-border bg-muted/40 text-foreground">
          <Info className="size-4 text-charcoal-500" />
          <div className="flex-1">
            <AlertTitle className="font-semibold text-sm">
              Checkout cancelled
            </AlertTitle>
            <AlertDescription className="text-xs pt-0.5 text-muted-foreground">
              Checkout cancelled. No charge was made.
            </AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-foreground"
            onClick={() => setReturnStatus(null)}
            aria-label="Dismiss banner"
          >
            <X className="size-3.5" />
          </Button>
        </Alert>
      )}

      {/* 1. UNKNOWN ERROR STATE */}
      {isUnknown ? (
        <Card className="border-border bg-card shadow-xs text-center py-10 px-6">
          <CardHeader className="space-y-2 pb-4">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-lg font-bold">
              We could not load your membership
            </CardTitle>
            <CardDescription className="text-xs max-w-md mx-auto">
              We were unable to retrieve your current membership status from the
              server. Please check your connection and try again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchSub()}
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              Retry
            </Button>
          </CardFooter>
        </Card>
      ) : subStatus === "PAST_DUE" ? (
        /* 2. PAST_DUE STATE */
        <Card className="border-amber-500/40 bg-amber-500/5 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-600" />
              <CardTitle className="text-base font-bold text-foreground">
                Payment Past Due
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-amber-800 dark:text-amber-300">
              Your last payment failed. Premium benefits are paused until the
              payment is fixed.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 text-xs text-muted-foreground space-y-3">
            <p>
              Please update your billing method to restore your priority queue
              access and 10% labor discounts.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 transition-colors"
              >
                Contact support
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : isPremium && subscription ? (
        /* 3. ACTIVE PREMIUM STATE */
        <div className="space-y-6">
          <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-xs overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Crown className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                        You are a Premium member
                      </h2>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5">
                        ACTIVE
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subscription.plan?.name || "Premium Plan"}
                      {subscription.plan?.priceCents
                        ? ` • ${formatMoney(subscription.plan.priceCents)}/${formatInterval(subscription.plan.interval)}`
                        : ""}
                    </p>
                  </div>
                </div>

                {!subscription.cancelAtPeriodEnd && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs shrink-0 self-start sm:self-center"
                    onClick={() => setIsCancelDialogOpen(true)}
                  >
                    Cancel renewal
                  </Button>
                )}
              </div>

              {/* Renewal or Expiration Notice */}
              <div className="rounded-xl border border-emerald-500/20 bg-card p-4 text-xs">
                {subscription.cancelAtPeriodEnd ? (
                  <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <span>
                      Your renewal is cancelled. Premium ends on{" "}
                      <strong className="font-semibold text-foreground">
                        {safeFormatDate(subscription.currentPeriodEnd)}
                      </strong>
                      .
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-muted-foreground">
                    <span>Next automatic renewal date:</span>
                    <span className="font-semibold text-foreground">
                      {safeFormatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                )}
              </div>

              {/* Benefit Recap */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Active Benefits
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PREMIUM_BENEFITS.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                          <Icon className="size-4" />
                          <span>{b.title}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Renewal Confirmation Dialog */}
          <AlertDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your renewal?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-relaxed">
                  Cancel your renewal? You keep all Premium benefits until{" "}
                  <strong>
                    {safeFormatDate(subscription.currentPeriodEnd)}
                  </strong>
                  . After that you return to the free plan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  disabled={cancelRenewalMutation.isPending}
                  className="text-xs"
                >
                  Keep Membership
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={cancelRenewalMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    cancelRenewalMutation.mutate();
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
                >
                  {cancelRenewalMutation.isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Cancelling...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        /* 4. UNSUBSCRIBED / EXPIRED / ENDED CANCELLED STATE: PRICING VIEW */
        <div className="space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <Sparkles className="size-3.5" />
              <span>Priority Customer Membership</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
              Upgrade to Premium
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Get priority review within 2 hours, 10% discount on labor charges,
              and zero late fees on rescheduled visits.
            </p>
          </div>

          {/* Pricing Cards Grid */}
          {isPlansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          ) : isPlansError ? (
            <div className="p-8 border border-border rounded-2xl bg-card text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Unable to load subscription plans (
                {plansError instanceof Error
                  ? plansError.message
                  : "Network error"}
                ).
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchPlans()}
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-8 border border-border rounded-2xl bg-card text-center text-xs text-muted-foreground">
              No subscription plans are currently available. Please check back
              later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {plans.map((plan) => {
                const intervalNoun = formatInterval(plan.interval);
                const isYearly = intervalNoun === "year";
                const isSubmitting =
                  checkoutMutation.isPending && selectedPlanId === plan.id;
                const anyPending = checkoutMutation.isPending;

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col justify-between border-2 transition-all duration-200 bg-card rounded-2xl shadow-xs",
                      isYearly
                        ? "border-brand-500 shadow-md md:scale-[1.02]"
                        : "border-border hover:border-brand-500/40",
                    )}
                  >
                    {isYearly && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <Badge className="bg-brand-600 text-white font-semibold px-3 py-0.5 shadow-sm text-xs">
                          Best value
                          {yearlySavingsPercent > 0
                            ? ` • Save ${yearlySavingsPercent}% compared with monthly`
                            : ""}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className={cn("pb-4", isYearly && "pt-7")}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-heading text-lg font-bold text-foreground">
                          {plan.name}
                        </CardTitle>
                        {isYearly && (
                          <Crown className="size-5 text-amber-500" />
                        )}
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        {isYearly
                          ? "Maximum annual savings with year-round priority."
                          : "Flexible month-to-month coverage."}
                      </CardDescription>

                      {/* Price Display */}
                      <div className="pt-3 flex items-baseline gap-1.5">
                        <span className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
                          {formatMoney(plan.priceCents)}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          /{intervalNoun}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 flex-1">
                      <div className="border-t border-border pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                          Included Membership Perks:
                        </p>
                        <ul className="space-y-2.5">
                          {PREMIUM_BENEFITS.map((benefit) => (
                            <li
                              key={benefit.id}
                              className="flex items-start gap-2.5 text-xs text-foreground/90"
                            >
                              <div className="size-4 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="size-3 stroke-[2.5]" />
                              </div>
                              <div>
                                <span className="font-semibold block">
                                  {benefit.title}
                                </span>
                                <span className="text-muted-foreground text-[11px]">
                                  {benefit.description}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-4 pb-6">
                      <Button
                        type="button"
                        variant="cta"
                        className="w-full justify-center font-bold h-11 text-sm shadow-xs"
                        disabled={anyPending}
                        onClick={() => checkoutMutation.mutate(plan.id)}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            <span>Redirecting to secure checkout...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-4 mr-2" />
                            <span>Subscribe</span>
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Test Mode Note */}
          <p className="text-center text-xs text-muted-foreground">
            Test mode: use card 4242 4242 4242 4242
          </p>

          {/* Comparison Table Free vs Premium */}
          <div className="space-y-3 pt-6 border-t border-border">
            <div className="text-center space-y-1">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Compare Plans
              </h2>
              <p className="text-xs text-muted-foreground">
                See how Premium membership enhances your service experience.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-foreground w-1/2">
                      Feature
                    </th>
                    <th className="p-3.5 font-bold text-muted-foreground w-1/4">
                      Free Plan
                    </th>
                    <th className="p-3.5 font-bold text-brand-600 dark:text-brand-400 w-1/4">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PLAN_COMPARISON_FEATURES.map((item) => (
                    <tr
                      key={item.name}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-3.5">
                        <span className="font-semibold text-foreground block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.description}
                        </span>
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {typeof item.free === "boolean" ? (
                          item.free ? (
                            <Check className="size-4 text-emerald-600" />
                          ) : (
                            <Minus
                              className="size-4 text-muted-foreground"
                              aria-label="Not included"
                            />
                          )
                        ) : (
                          <span>{item.free}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">
                        {typeof item.premium === "boolean" ? (
                          item.premium ? (
                            <Check className="size-4 text-emerald-600" />
                          ) : (
                            <Minus
                              className="size-4 text-muted-foreground"
                              aria-label="Not included"
                            />
                          )
                        ) : (
                          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                            <CheckCircle2 className="size-3.5 shrink-0" />
                            <span>{item.premium}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
