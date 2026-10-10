import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AboutHero } from "@/components/marketing/about-hero";
import { AudienceSection } from "@/components/marketing/audience-section";
import { BuiltWithSection } from "@/components/marketing/built-with-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { PrinciplesSection } from "@/components/marketing/principles-section";
import { WhatWeDoSection } from "@/components/marketing/what-we-do-section";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/constants/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Field Service: a unified platform bringing transparent scheduling, verified dispatching, digital reporting, and secure payments to field maintenance operations.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About | Field Service",
    description:
      "One transparent process connecting property owners with skilled technicians, from request to payment.",
    url: "/about",
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "About Field Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Field Service",
    description:
      "One transparent process connecting property owners with skilled technicians, from request to payment.",
    images: ["/opengraph-image"],
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AboutHero />
      <WhatWeDoSection />
      <HowItWorksSection />
      <AudienceSection />
      <PrinciplesSection />
      <BuiltWithSection />

      {/* Closing CTA Band */}
      <section
        aria-labelledby="about-cta-heading"
        className="py-16 bg-[#111827] border-t border-[#1F2937] text-white text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2
            id="about-cta-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
          >
            Ready to schedule a service visit?
          </h2>
          <p className="text-sm sm:text-base text-[#E2E8F0] max-w-xl mx-auto">
            Book online in under 3 minutes, or reach out to our team if you have
            questions about our operational platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "lg" }),
                "w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-md",
              )}
            >
              Book a Service
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto h-12 px-8 text-base font-medium text-[#E2E8F0] border-charcoal-700 bg-charcoal-800/60 hover:bg-charcoal-800 hover:text-white hover:border-charcoal-600",
              )}
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
