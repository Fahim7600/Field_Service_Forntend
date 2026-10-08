import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomerDashboardOverview } from "@/components/customer/customer-dashboard-overview";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Customer Dashboard | Field Service",
  description:
    "Book services, track technician arrival, manage invoices, and upgrade to premium.",
};

export default function CustomerDashboardPage() {
  return (
    <Container className="py-6 space-y-6">
      <DashboardWelcomeHeader
        title="Customer Workspace"
        description="Book on-demand repairs, track technician arrival in real-time, and manage service invoices."
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        <CustomerDashboardOverview />
      </Suspense>
    </Container>
  );
}
