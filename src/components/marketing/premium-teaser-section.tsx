import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PREMIUM_BENEFITS } from "@/constants/premium";
import { formatMoney } from "@/lib/format";
import { getYearlySavings } from "@/lib/plan-utils";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/types/subscription";

interface PremiumTeaserSectionProps {
  plans?: SubscriptionPlan[];
}

export function PremiumTeaserSection({
  plans = [],
}: PremiumTeaserSectionProps) {
  const monthlyPlan = plans.find((p) => {
    const inv = String(p.interval || "").toUpperCase();
    return inv === "MONTH" || inv === "MONTHLY";
  });
  const yearlyPlan = plans.find((p) => {
    const inv = String(p.interval || "").toUpperCase();
    return inv === "YEAR" || inv === "YEARLY" || inv === "ANNUAL";
  });

  const hasPricing = Boolean(monthlyPlan || yearlyPlan);
  const savings =
    monthlyPlan && yearlyPlan
      ? getYearlySavings(monthlyPlan.priceCents, yearlyPlan.priceCents)
      : null;

  return (
    <section
      aria-labelledby="premium-teaser-heading"
      className="py-16 sm:py-24 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-charcoal-950 border border-charcoal-800 p-8 sm:p-12 lg:p-16 text-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Benefits & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Premium Membership
              </div>

              <h2
                id="premium-teaser-heading"
                className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
              >
                Get priority dispatch and 10% off every service invoice
              </h2>

              <p className="text-sm sm:text-base text-ash leading-relaxed max-w-xl">
                Field Service Premium provides peace of mind for residential and
                commercial property managers who need guaranteed fast turnaround
                and flexible scheduling.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {PREMIUM_BENEFITS.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="p-4 rounded-xl bg-charcoal-800/60 border border-charcoal-700/60"
                  >
                    <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs sm:text-sm">
                      <benefit.icon className="h-4 w-4 shrink-0" />
                      <span>{benefit.title}</span>
                    </div>
                    <p className="text-xs text-ash leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Pricing Card or Teaser CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="rounded-2xl bg-charcoal-800/90 border border-charcoal-700 p-6 sm:p-8 backdrop-blur-xs text-center flex flex-col items-center">
                <h3 className="text-lg font-bold text-white mb-2">
                  Membership Plans
                </h3>
                <p className="text-xs sm:text-sm text-ash mb-6">
                  Cancel or pause anytime. No long-term lock-in.
                </p>

                {hasPricing ? (
                  <div className="w-full space-y-3 mb-6">
                    {monthlyPlan && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/60 border border-charcoal-700/80 text-left">
                        <div>
                          <p className="text-xs font-medium text-white">
                            Monthly Plan
                          </p>
                          <p className="text-xs text-ash">Billed monthly</p>
                        </div>
                        <p className="text-base font-bold text-white">
                          {formatMoney(monthlyPlan.priceCents)}
                          <span className="text-xs font-normal text-ash">
                            /mo
                          </span>
                        </p>
                      </div>
                    )}

                    {yearlyPlan && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-charcoal-900/60 border border-amber-500/40 text-left relative">
                        {savings && savings.percent > 0 && (
                          <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-charcoal-950 font-bold text-[10px]">
                            Save {savings.percent}%
                          </span>
                        )}
                        <div>
                          <p className="text-xs font-medium text-white">
                            Annual Plan
                          </p>
                          <p className="text-xs text-ash">Billed annually</p>
                        </div>
                        <p className="text-base font-bold text-amber-400">
                          {formatMoney(yearlyPlan.priceCents)}
                          <span className="text-xs font-normal text-ash">
                            /yr
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full py-4 mb-4 border-y border-charcoal-700/60 text-xs text-ash text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Guaranteed 2-hour request review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Automatic 10% labor discount on invoices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Free reschedule & cancellation anytime</span>
                    </div>
                  </div>
                )}

                <Link
                  href="/pricing"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "w-full h-11 text-sm font-semibold",
                  )}
                >
                  See plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
