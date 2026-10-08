import type { Metadata } from "next";
import { ServiceRequestWizard } from "@/components/forms/service-request-wizard";
import { PageHeader } from "@/components/shared/page-header";

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
      <ServiceRequestWizard />
    </div>
  );
}
