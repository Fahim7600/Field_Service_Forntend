import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentsListClient } from "@/components/payments/payments-list-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "Your payment history, transaction receipts, and payment status.",
};

export default function CustomerPaymentsPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader title="Payments" description="Your payment history" />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        }
      >
        <PaymentsListClient variant="customer" />
      </Suspense>
    </Container>
  );
}
