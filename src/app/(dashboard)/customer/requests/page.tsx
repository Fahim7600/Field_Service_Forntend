import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerRequestsClient } from "@/components/customer/customer-requests-client";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Service Requests",
  description: "View and manage your submitted field service requests.",
};

function RequestsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((key) => (
          <Skeleton key={key} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function CustomerRequestsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Service Requests"
        description="Track the status of your booked services, inspect details, or edit pending requests."
      />
      <Suspense fallback={<RequestsLoadingSkeleton />}>
        <CustomerRequestsClient />
      </Suspense>
    </div>
  );
}
