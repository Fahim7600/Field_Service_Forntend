import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FinalCtaSection() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="py-16 sm:py-20 bg-[#111827] border-t border-[#1F2937] text-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2
          id="final-cta-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
        >
          Ready to schedule a service visit?
        </h2>

        <p className="text-base sm:text-lg text-[#E2E8F0] max-w-2xl mx-auto leading-relaxed">
          Submit your issue in minutes. Our team will review the details, match
          an experienced technician, and keep you informed every step of the
          way.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
            href="/register"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full sm:w-auto h-12 px-8 text-base font-medium text-[#E2E8F0] border-charcoal-700 bg-charcoal-800/60 hover:bg-charcoal-800 hover:text-white hover:border-charcoal-600",
            )}
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}
