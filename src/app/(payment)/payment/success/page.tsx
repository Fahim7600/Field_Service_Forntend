import type { Metadata } from "next";
import { Suspense } from "react";

import { PaymentStatusClient } from "@/components/payment/payment-status-client";
import { Skeleton } from "@/components/ui/skeleton";
import { parseSessionId } from "@/lib/session-id";

export const metadata: Metadata = {
  title: "Payment Confirmation | Field Service",
  description: "Verifying your payment transaction with Stripe.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const validSessionId = parseSessionId(session_id);

  return (
    <Suspense
      fallback={
        <div className="p-8 bg-card rounded-2xl border border-border space-y-4 text-center">
          <Skeleton className="size-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      }
    >
      <PaymentStatusClient sessionId={validSessionId} />
    </Suspense>
  );
}
