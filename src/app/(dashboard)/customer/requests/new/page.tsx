import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceRequestWizard } from "@/components/forms/service-request-wizard";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Book a Service",
  description:
    "Request a professional field service technician for your home or business.",
};

export default function NewServiceRequestPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a Service"
        description="Tell us what you need help with, choose your preferred schedule, and attach photos."
      />
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        }
      >
        <ServiceRequestWizard />
      </Suspense>
    </div>
  );
}
