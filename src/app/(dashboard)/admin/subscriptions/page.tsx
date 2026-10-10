import type { Metadata } from "next";
import { Suspense } from "react";

import { SubscriptionsClient } from "@/components/admin/subscriptions-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Premium Subscriptions | Admin",
  description: "Customers on a paid plan.",
};

function SubscriptionsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Premium subscriptions"
        description="Customers on a paid plan"
      />

      <Suspense fallback={<SubscriptionsLoadingFallback />}>
        <SubscriptionsClient />
      </Suspense>
    </Container>
  );
}
