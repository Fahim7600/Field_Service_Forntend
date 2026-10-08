import { ArrowRight, Clock, CreditCard, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Field Service | Reliable On-Demand Repairs",
  description:
    "Connect with verified professionals for HVAC, plumbing, and electrical repairs instantly. Transparent pricing, priority dispatch, and guaranteed quality.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center items-center text-center px-4 bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-5xl md:text-7xl font-extrabold text-charcoal-900 tracking-tight max-w-4xl">
          Reliable Field Service, On Demand.
        </h1>
        <p className="text-lg md:text-xl text-charcoal-600 max-w-2xl mt-4">
          Connect with verified professionals for HVAC, plumbing, and electrical
          repairs instantly. Transparent pricing, priority dispatch, and
          guaranteed quality.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ variant: "cta", size: "lg" }),
              "h-12 px-6 text-base font-semibold",
            )}
          >
            Book a Service
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/services"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 px-6 text-base font-semibold text-charcoal-900 border-gray-300 hover:bg-gray-100",
            )}
          >
            View Services
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-4 md:px-8 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Card 1 */}
          <div className="bg-panel border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <ShieldCheck className="text-brand-500 w-10 h-10" />
            <h2 className="text-xl font-bold text-charcoal-900 mt-4">
              Verified Technicians
            </h2>
            <p className="text-charcoal-600 mt-2 leading-relaxed">
              Every professional is thoroughly vetted, licensed, and insured for
              your peace of mind.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-panel border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <Clock className="text-brand-500 w-10 h-10" />
            <h2 className="text-xl font-bold text-charcoal-900 mt-4">
              Fast Priority Dispatch
            </h2>
            <p className="text-charcoal-600 mt-2 leading-relaxed">
              Premium members get guaranteed 2-hour review times and priority
              scheduling.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-panel border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <CreditCard className="text-brand-500 w-10 h-10" />
            <h2 className="text-xl font-bold text-charcoal-900 mt-4">
              Transparent Pricing
            </h2>
            <p className="text-charcoal-600 mt-2 leading-relaxed">
              No hidden fees. Pay securely online only after the job is
              completed.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section (Dark Contrast) */}
      <section className="py-20 bg-charcoal-900 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Ready to fix it today?
          </h2>
          <p className="text-charcoal-300 mt-3 text-base md:text-lg">
            Join thousands of satisfied homeowners and businesses. Request a
            technician in under 2 minutes.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-8 rounded-md transition-colors shadow-md"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
