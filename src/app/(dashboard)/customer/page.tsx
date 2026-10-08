import type { Metadata } from "next";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";

export const metadata: Metadata = {
  title: "Customer Portal",
  description:
    "Field Service customer portal for booking and service tracking.",
};

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader
        title="Customer Portal"
        description="Book services, track technician arrival, and view past job history."
      />
    </div>
  );
}
