import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerOverviewClient } from "@/components/customer/customer-overview-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Customer Workspace | Field Service",
  description:
    "Book certified field repairs, track live technician visits, and manage service invoices.",
};

export default function CustomerDashboardPage() {
  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
            </div>
          </div>
        }
      >
        <CustomerOverviewClient />
      </Suspense>
    </Container>
  );
}
