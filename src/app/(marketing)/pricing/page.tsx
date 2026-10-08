import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Premium Membership | Field Service",
  description:
    "Unlock priority dispatch and exclusive discounts for your household.",
};

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <PageHeader
        title="Premium Membership"
        description="Unlock priority dispatch and exclusive discounts for your household."
      />

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 items-stretch">
        {/* Card 1 (Free/Basic) */}
        <div className="bg-white border border-gray-200 p-8 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-charcoal-900">Basic</h2>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-charcoal-900 tracking-tight">
                $0
              </span>
              <span className="ml-1 text-charcoal-500 text-base">/mo</span>
            </div>
            <p className="text-sm text-charcoal-600 mt-2">
              Essential field service coverage for occasional repairs.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-charcoal-900 shrink-0" />
                <span className="text-charcoal-800 text-sm font-medium">
                  Standard 24h review
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-charcoal-900 shrink-0" />
                <span className="text-charcoal-800 text-sm font-medium">
                  Pay standard labor rates
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-charcoal-900 shrink-0" />
                <span className="text-charcoal-800 text-sm font-medium">
                  Secure online payments
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-11 text-base font-semibold border-gray-300 text-charcoal-900 hover:bg-gray-100 justify-center",
              )}
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Card 2 (Premium - High Contrast) */}
        <div className="bg-charcoal-900 text-white border-2 border-brand-500 p-8 rounded-2xl relative shadow-xl shadow-brand-500/10 flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-brand-500 text-white px-3 py-1 rounded-full text-sm font-bold -mt-3.5 mr-6 shadow-sm uppercase tracking-wide">
            MOST POPULAR
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Premium</h2>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                $5
              </span>
              <span className="ml-1 text-charcoal-300 text-base">
                /mo or $50/yr
              </span>
            </div>
            <p className="text-sm text-charcoal-300 mt-2">
              VIP priority dispatch and instant 10% discount on all service
              work.
            </p>

            <ul className="mt-8 space-y-4">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-brand-500 shrink-0" />
                <span className="text-white text-sm font-medium">
                  Priority 2-hour review
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-brand-500 shrink-0" />
                <span className="text-white text-sm font-medium">
                  10% off all labor charges
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-brand-500 shrink-0" />
                <span className="text-white text-sm font-medium">
                  Zero cancellation fees
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-full h-11 text-base font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-md transition-colors shadow-md"
            >
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="mt-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-charcoal-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" defaultValue="faq-1" collapsible>
          <AccordionItem value="faq-1">
            <AccordionTrigger className="text-lg">
              Can I cancel anytime?
            </AccordionTrigger>
            <AccordionContent className="text-base text-charcoal-600">
              Yes, you can cancel your Premium subscription from your dashboard
              at any time. Benefits continue until the end of your billing
              cycle.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2">
            <AccordionTrigger className="text-lg">
              How does the 10% discount work?
            </AccordionTrigger>
            <AccordionContent className="text-base text-charcoal-600">
              The 10% discount is automatically applied to the labor/service
              charge of every invoice generated while your subscription is
              active.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
