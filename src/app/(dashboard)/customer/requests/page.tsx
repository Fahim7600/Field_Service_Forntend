import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerRequestsClient } from "@/components/requests/customer-requests-client";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Service Requests",
  description: "View and manage your submitted field service requests.",
};

const SKELETON_KEYS = [
  "req-sk-1",
  "req-sk-2",
  "req-sk-3",
  "req-sk-4",
  "req-sk-5",
];

function RequestsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="space-y-3">
        {SKELETON_KEYS.map((key) => (
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
        description="Track the status of your booked services, view quotes, or cancel pending requests."
      />
      <Suspense fallback={<RequestsLoadingSkeleton />}>
        <CustomerRequestsClient />
      </Suspense>
    </div>
  );
}
