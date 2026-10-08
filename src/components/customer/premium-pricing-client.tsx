"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Check,
  CheckCircle2,
  Crown,
  Flame,
  Loader2,
  Percent,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

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

import { getErrorMessage } from "@/lib/api-client";
import { formatCurrencyCents } from "@/lib/format-currency";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { SubscriptionPlan } from "@/types/api";

const DEFAULT_BENEFITS = [
  "Priority Dispatch & Fast-Track Queue",
  "10% Automatic Discount on all labor charges",
  "Zero cancellation fees on scheduled visits",
  "Dedicated 24/7 priority customer support",
  "Complimentary annual system health inspection",
];

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "plan_monthly_standard",
    name: "Monthly Premium",
    interval: "MONTH",
    priceCents: 1999,
    description:
      "Flexible month-to-month priority coverage for your home or business.",
    features: DEFAULT_BENEFITS,
  },
  {
    id: "plan_yearly_pro",
    name: "Annual VIP",
    interval: "YEAR",
    priceCents: 19999,
    description:
      "Best value with 2 months free and VIP dispatch guarantees all year.",
    features: [
      ...DEFAULT_BENEFITS,
      "VIP Dedicated Account Manager",
      "Two months free (17% savings)",
    ],
  },
];

export function PremiumPricingClient() {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string | null>(
    null,
  );

  // Fetch plans from backend
  const { data: plansData, isLoading: isPlansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => financeService.fetchSubscriptionPlans(),
    staleTime: 60000,
  });

  // Fetch current user subscription
  const { data: mySubscription, isLoading: isSubLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => financeService.fetchMySubscription(),
    staleTime: 30000,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      setSelectedPlanId(planId);
      return financeService.createSubscriptionCheckout({ planId });
    },
    onSuccess: (res) => {
      const redirectUrl = res.url || res.checkoutUrl || res.paymentUrl;
      if (redirectUrl) {
        toast.info("Redirecting to secure Stripe Checkout...");
        window.location.href = redirectUrl;
      } else {
        toast.error("Stripe checkout URL was not returned by server.");
        setSelectedPlanId(null);
      }
    },
    onError: (err) => {
      setSelectedPlanId(null);
      toast.error(getErrorMessage(err));
    },
  });

  const plans = plansData && plansData.length > 0 ? plansData : FALLBACK_PLANS;
  const isMemberActive = mySubscription?.status === "ACTIVE";

  if (isPlansLoading || isSubLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Sparkles className="size-3.5" />
          <span>Field Service VIP Membership</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
          Upgrade to Premium
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
          Get priority technician dispatch, 10% instant discount on all labor
          charges, and dedicated VIP support on every service request.
        </p>
      </div>

      {/* Active Member Banner */}
      {isMemberActive && (
        <Card className="border-emerald-500/40 bg-emerald-500/5 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Crown className="size-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    You are an Active Premium Member!
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold"
                  >
                    ACTIVE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your VIP membership perks (10% labor discount & priority
                  dispatch) are automatically applied to all your service
                  orders.
                </p>
                {mySubscription.currentPeriodEnd && (
                  <p className="text-xs text-charcoal-600 dark:text-charcoal-400 pt-1">
                    Current period renews on:{" "}
                    <span className="font-medium text-foreground">
                      {formatSafeDate(mySubscription.currentPeriodEnd)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <Badge
              variant="outline"
              className="text-xs font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-300 py-1.5 px-3"
            >
              Perks Active
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan, _index) => {
          const isYearly =
            plan.interval?.toUpperCase() === "YEAR" ||
            plan.name.toLowerCase().includes("year") ||
            plan.name.toLowerCase().includes("annual");
          const isPopular = isYearly;
          const planFeatures =
            plan.features && plan.features.length > 0
              ? plan.features
              : isYearly
                ? FALLBACK_PLANS[1].features || DEFAULT_BENEFITS
                : DEFAULT_BENEFITS;

          const isSubmitting =
            checkoutMutation.isPending && selectedPlanId === plan.id;

          return (
            <Card
              key={plan.id || plan.name}
              className={cn(
                "relative flex flex-col justify-between border-2 transition-all duration-200 bg-card rounded-2xl shadow-xs",
                isPopular
                  ? "border-primary shadow-md md:scale-[1.02]"
                  : "border-border hover:border-primary/40",
              )}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1 shadow-sm gap-1 text-xs">
                    <Flame className="size-3.5 fill-current" />
                    <span>Best Value • 2 Months Free</span>
                  </Badge>
                </div>
              )}

              <CardHeader className={cn("pb-6", isPopular && "pt-7")}>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-xl font-bold text-foreground">
                    {plan.name}
                  </CardTitle>
                  {isPopular && <Crown className="size-5 text-amber-500" />}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {plan.description ||
                    (isYearly
                      ? "Year-round priority and maximum savings."
                      : "Month-to-month VIP protection.")}
                </CardDescription>

                {/* Price Display */}
                <div className="pt-4 flex items-baseline gap-1.5">
                  <span className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground">
                    {formatCurrencyCents(plan.priceCents)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <div className="border-t border-border/80 pt-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Included Benefits:
                  </p>
                  <ul className="space-y-2.5">
                    {planFeatures.map((benefit) => (
                      <li
                        key={benefit}
                        className="flex items-start gap-2.5 text-xs text-muted-foreground"
                      >
                        <div className="size-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="size-3 stroke-[2.5]" />
                        </div>
                        <span className="text-foreground/90">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="pt-4 pb-6">
                {isMemberActive ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full justify-center text-xs font-semibold"
                  >
                    <CheckCircle2 className="size-4 text-emerald-600 mr-1.5" />
                    <span>Currently Active</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant={isPopular ? "default" : "outline"}
                    className={cn(
                      "w-full justify-center font-semibold h-11 text-sm shadow-xs",
                      isPopular &&
                        "bg-primary hover:bg-primary/90 text-primary-foreground",
                    )}
                    disabled={checkoutMutation.isPending}
                    onClick={() => checkoutMutation.mutate(plan.id)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        <span>Connecting to Stripe...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4 mr-2" />
                        <span>Subscribe Now</span>
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Value Guarantee / Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border">
          <Zap className="size-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">
              Fast Dispatch
            </span>
            <span className="text-muted-foreground">
              Jump to top of review queue
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border">
          <Percent className="size-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">
              10% Labor Off
            </span>
            <span className="text-muted-foreground">
              Applied on every single invoice
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border">
          <ShieldCheck className="size-5 text-blue-500 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-foreground block">
              Cancel Anytime
            </span>
            <span className="text-muted-foreground">
              No long term commitments
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
