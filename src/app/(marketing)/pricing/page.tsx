import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection } from "@/components/marketing/faq-section";
import { JsonLd } from "@/components/shared/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { FAQ_ITEMS } from "@/constants/faq";
import { PREMIUM_BENEFITS } from "@/constants/premium";
import { siteConfig } from "@/constants/site";
import { formatMoney } from "@/lib/format";
import { formatInterval, getYearlySavings } from "@/lib/plan-utils";
import { getPublicPlans } from "@/lib/public-data";
import { buildFaqJsonLd } from "@/lib/seo/faq-json-ld";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore transparent pricing for Field Service. Standard booking is free, and optional Premium memberships offer priority dispatch, labor discounts, and free schedule changes.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Field Service",
    description:
      "Simple, transparent pricing. Booking is free, and optional Premium memberships offer priority dispatch and invoice discounts.",
    url: "/pricing",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Field Service Membership Plans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Field Service",
    description:
      "Simple, transparent pricing. Booking is free, and optional Premium memberships offer priority dispatch and invoice discounts.",
    images: ["/opengraph-image"],
  },
};

interface TableFeature {
  name: string;
  free: string | boolean;
  premium: string | boolean;
}

const COMPARISON_ROWS: TableFeature[] = [
  {
    name: "Request Review Turnaround",
    free: "Within 24 hours",
    premium: "Within 2 hours (Priority)",
  },
  {
    name: "Invoice Labor Discount",
    free: false,
    premium: "10% off the labor charge",
  },
  {
    name: "Cancel or Reschedule",
    free: "Free > 24h prior, otherwise $5.00 late fee",
    premium: "Free until technician arrives on site",
  },
  {
    name: "Online Payments with Stripe",
    free: true,
    premium: true,
  },
  {
    name: "Service History & Work Reports",
    free: true,
    premium: true,
  },
  {
    name: "In-App Notifications",
    free: true,
    premium: true,
  },
];

export default async function PricingPage() {
  const { data: plans } = await getPublicPlans();

  const monthlyPlan = plans.find((p) => {
    const inv = String(p.interval || "").toUpperCase();
    return inv === "MONTH" || inv === "MONTHLY";
  });

  const yearlyPlan = plans.find((p) => {
    const inv = String(p.interval || "").toUpperCase();
    return inv === "YEAR" || inv === "YEARLY" || inv === "ANNUAL";
  });

  const hasLivePlans = Boolean(monthlyPlan || yearlyPlan);

  const yearlySavings =
    monthlyPlan && yearlyPlan
      ? getYearlySavings(monthlyPlan.priceCents, yearlyPlan.priceCents)
      : null;

  const pricingFaqItems = FAQ_ITEMS.filter(
    (item) =>
      item.category === "premium" ||
      item.category === "payments" ||
      item.id === "cancel-or-reschedule",
  );

  const faqLd = buildFaqJsonLd(pricingFaqItems);

  return (
    <>
      <JsonLd data={faqLd} />
      <div className="flex flex-col min-h-screen">
        {/* Header Section */}
        <section
          aria-labelledby="pricing-header-heading"
          className="py-16 sm:py-20 bg-gradient-to-b from-charcoal-900 to-charcoal-950 text-white border-b border-charcoal-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
            <div className="max-w-3xl">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Membership & Plans
              </p>
              <h1
                id="pricing-header-heading"
                className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
              >
                Simple, transparent pricing
              </h1>
              <p className="text-base sm:text-lg text-[#E2E8F0] mt-4 leading-relaxed">
                Booking service visits is completely free. Premium membership is
                optional for property owners who want priority review turnaround
                and ongoing invoice labor savings.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section
          aria-labelledby="plans-cards-heading"
          className="py-16 sm:py-24 bg-background"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="plans-cards-heading" className="sr-only">
              Available Service Plans
            </h2>

            {hasLivePlans ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* 1. Free Plan */}
                <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-xs justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Free</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay-as-you-go service
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">
                        {formatMoney(0)}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground">
                        /forever
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
                      Standard field service coverage for residential and
                      commercial properties.
                    </p>

                    <ul className="mt-8 space-y-3.5 border-t border-border pt-6">
                      <li className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0 mt-0.5" />
                        <span>Standard 24-hour review turnaround</span>
                      </li>
                      <li className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0 mt-0.5" />
                        <span>Standard transparent labor charges</span>
                      </li>
                      <li className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0 mt-0.5" />
                        <span>Free cancellation &gt; 24h before visit</span>
                      </li>
                      <li className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0 mt-0.5" />
                        <span>Detailed digital service reports</span>
                      </li>
                      <li className="flex items-start gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0 mt-0.5" />
                        <span>Secure online checkout via Stripe</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4">
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full h-11 text-sm font-semibold justify-center",
                      )}
                    >
                      Get started
                    </Link>
                  </div>
                </div>

                {/* 2. Premium Monthly */}
                {monthlyPlan && (
                  <div className="flex flex-col rounded-2xl border border-charcoal-700 bg-charcoal-900 text-white p-8 shadow-md justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {monthlyPlan.name}
                      </h3>
                      <p className="text-xs text-ash mt-1">Billed monthly</p>
                      <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white tracking-tight">
                          {formatMoney(monthlyPlan.priceCents)}
                        </span>
                        <span className="text-sm font-medium text-ash">
                          /{formatInterval(monthlyPlan.interval)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-ash mt-3 leading-relaxed">
                        Flexible monthly VIP coverage. Cancel renewal anytime
                        with zero lock-in.
                      </p>

                      <ul className="mt-8 space-y-3.5 border-t border-charcoal-800 pt-6">
                        {PREMIUM_BENEFITS.map((benefit) => (
                          <li
                            key={benefit.id}
                            className="flex items-start gap-3 text-xs sm:text-sm text-ash"
                          >
                            <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-white font-semibold">
                                {benefit.title}:
                              </strong>{" "}
                              {benefit.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4">
                      <Link
                        href="/customer/premium"
                        className={cn(
                          buttonVariants({ variant: "cta", size: "lg" }),
                          "w-full h-11 text-sm font-semibold justify-center shadow-md",
                        )}
                      >
                        Subscribe
                      </Link>
                    </div>
                  </div>
                )}

                {/* 3. Premium Yearly */}
                {yearlyPlan && (
                  <div className="relative flex flex-col rounded-2xl border-2 border-amber-500 bg-charcoal-900 text-white p-8 shadow-xl shadow-amber-500/10 justify-between">
                    <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-amber-500 text-charcoal-950 font-extrabold text-xs tracking-wider uppercase shadow-sm">
                      Best value
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {yearlyPlan.name}
                      </h3>
                      <p className="text-xs text-ash mt-1">Billed annually</p>
                      <div className="mt-6 flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-amber-400 tracking-tight">
                          {formatMoney(yearlyPlan.priceCents)}
                        </span>
                        <span className="text-sm font-medium text-ash">
                          /{formatInterval(yearlyPlan.interval)}
                        </span>
                        {yearlySavings && yearlySavings.percent > 0 && (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                            Save {yearlySavings.percent}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ash mt-3 leading-relaxed">
                        Full-year priority review, ongoing labor discounts, and
                        peace of mind.
                      </p>

                      <ul className="mt-8 space-y-3.5 border-t border-charcoal-800 pt-6">
                        {PREMIUM_BENEFITS.map((benefit) => (
                          <li
                            key={benefit.id}
                            className="flex items-start gap-3 text-xs sm:text-sm text-ash"
                          >
                            <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-white font-semibold">
                                {benefit.title}:
                              </strong>{" "}
                              {benefit.description}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4">
                      <Link
                        href="/customer/premium"
                        className={cn(
                          buttonVariants({ variant: "cta", size: "lg" }),
                          "w-full h-11 text-sm font-semibold justify-center shadow-md",
                        )}
                      >
                        Subscribe
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback when backend plans are temporarily unreachable */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-xs justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Free</h3>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">
                        {formatMoney(0)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                      Standard field service booking for occasional repairs.
                    </p>
                    <ul className="mt-8 space-y-3.5 border-t border-border pt-6">
                      <li className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0" />
                        <span>Standard 24-hour review</span>
                      </li>
                      <li className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0" />
                        <span>Standard labor charges</span>
                      </li>
                      <li className="flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-charcoal-700 dark:text-ash shrink-0" />
                        <span>Digital service reports</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8 pt-4">
                    <Link
                      href="/register"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full h-11 text-sm font-semibold justify-center",
                      )}
                    >
                      Get started
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col rounded-2xl border border-charcoal-700 bg-charcoal-900 text-white p-8 shadow-md justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Premium</h3>
                    <p className="text-xs text-ash mt-1">VIP Service Tier</p>
                    <p className="text-xs sm:text-sm text-ash mt-4 leading-relaxed">
                      Priority dispatch turnaround and 10% discount on labor
                      charges across all invoices.
                    </p>
                    <ul className="mt-8 space-y-3.5 border-t border-charcoal-800 pt-6">
                      {PREMIUM_BENEFITS.map((benefit) => (
                        <li
                          key={benefit.id}
                          className="flex items-start gap-3 text-xs sm:text-sm text-ash"
                        >
                          <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{benefit.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-4">
                    <Link
                      href="/customer/premium"
                      className={cn(
                        buttonVariants({ variant: "default", size: "lg" }),
                        "w-full h-11 text-sm font-semibold justify-center",
                      )}
                    >
                      See current plans
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section
          aria-labelledby="comparison-heading"
          className="py-16 sm:py-24 bg-panel border-t border-border"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C2410C]">
                Plan Comparison
              </p>
              <h2
                id="comparison-heading"
                className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A] mt-2"
              >
                Compare Free vs. Premium
              </h2>
              <p className="text-sm sm:text-base text-[#334155] mt-3">
                Review all policies and perks side by side before choosing your
                coverage tier.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-left border-collapse text-sm">
                <caption className="sr-only">
                  Feature comparison between Free and Premium membership plans
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th
                      scope="col"
                      className="py-4 px-6 font-bold text-[#0F172A] w-1/2 sm:w-2/5"
                    >
                      Feature
                    </th>
                    <th
                      scope="col"
                      className="py-4 px-6 font-bold text-[#0F172A] w-1/4 sm:w-3/10 text-center"
                    >
                      Free
                    </th>
                    <th
                      scope="col"
                      className="py-4 px-6 font-bold text-[#C2410C] w-1/4 sm:w-3/10 text-center"
                    >
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {COMPARISON_ROWS.map((row) => (
                    <tr
                      key={row.name}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <th
                        scope="row"
                        className="py-4 px-6 font-medium text-[#0F172A] text-xs sm:text-sm"
                      >
                        {row.name}
                      </th>
                      <td className="py-4 px-6 text-center text-xs sm:text-sm text-[#334155]">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <span className="inline-flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="h-4 w-4 shrink-0" />
                              <span className="sr-only">Included</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 text-[#475569] font-medium">
                              <X className="h-4 w-4 shrink-0 text-[#475569]/60" />
                              <span className="sr-only">Not included</span>
                            </span>
                          )
                        ) : (
                          <span>{row.free}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center text-xs sm:text-sm font-semibold text-[#0F172A]">
                        {typeof row.premium === "boolean" ? (
                          row.premium ? (
                            <span className="inline-flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="h-4 w-4 shrink-0" />
                              <span className="sr-only">Included</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 text-[#475569] font-medium">
                              <X className="h-4 w-4 shrink-0 text-[#475569]/60" />
                              <span className="sr-only">Not included</span>
                            </span>
                          )
                        ) : (
                          <span className="text-[#C2410C]">{row.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing FAQ Section with id="faq" */}
        <FaqSection
          id="faq"
          items={pricingFaqItems}
          heading="Frequently Asked Questions about Pricing"
          subheading="Everything you need to know about payments, invoices, cancellation fees, and Premium membership."
        />

        {/* Closing CTA Band */}
        <section
          aria-labelledby="pricing-cta-heading"
          className="py-16 bg-[#111827] border-t border-[#1F2937] text-white text-center"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h2
              id="pricing-cta-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            >
              Need a certified technician today?
            </h2>
            <p className="text-sm sm:text-base text-[#E2E8F0] max-w-xl mx-auto">
              You do not need a paid subscription to schedule a service visit.
              Book on-demand anytime with transparent pricing.
            </p>
            <div className="pt-2">
              <Link
                href="/customer/requests/new"
                className={cn(
                  buttonVariants({ variant: "cta", size: "lg" }),
                  "h-12 px-8 text-base font-semibold shadow-md",
                )}
              >
                Book a Service
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
