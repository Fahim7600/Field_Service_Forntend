import type { Metadata } from "next";
import { Suspense } from "react";

import { PremiumPricingClient } from "@/components/customer/premium-pricing-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Upgrade to Premium | Field Service VIP",
  description:
    "Get priority technician dispatch, 10% discount on all labor charges, and VIP benefits.",
};

export default function CustomerPremiumPage() {
  return (
    <Container className="py-8">
      <Suspense
        fallback={
          <div className="space-y-6 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-64 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        }
      >
        <PremiumPricingClient />
      </Suspense>
    </Container>
  );
}
