import { CheckCircle2, Shield, Users } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "About | Field Service",
  description:
    "Learn how Field Service bridges the gap between skilled technicians and homeowners.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <PageHeader
        title="About Field Service"
        description="Our mission to modernize home and commercial maintenance."
      />

      <div className="mt-8 max-w-3xl mx-auto">
        <p className="text-lg text-charcoal-600 leading-relaxed">
          Founded in 2026, Field Service bridges the gap between skilled
          technicians and homeowners. We believe that booking a repair should be
          as easy as ordering food online. Our platform ensures that every
          technician is verified, every job is tracked, and every payment is
          secure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
        <div className="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-brand-50 text-brand-600 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900">
            100% Vetted Pros
          </h3>
          <p className="text-sm text-charcoal-600 mt-2">
            Every technician is background-checked, certified, and insured.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-brand-50 text-brand-600 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900">
            Guaranteed Quality
          </h3>
          <p className="text-sm text-charcoal-600 mt-2">
            Clear upfront estimates and guaranteed post-service support.
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl text-center shadow-xs">
          <div className="inline-flex p-3 rounded-full bg-brand-50 text-brand-600 mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-charcoal-900">
            Customer First
          </h3>
          <p className="text-sm text-charcoal-600 mt-2">
            Real-time tracking, seamless messaging, and 24/7 dedicated support.
          </p>
        </div>
      </div>
    </div>
  );
}
