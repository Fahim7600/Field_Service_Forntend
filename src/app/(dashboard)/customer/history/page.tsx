import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerHistoryClient } from "@/components/customer/customer-history-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Service History | Customer Portal",
  description: "View past completed service requests and paid invoices.",
};

export default function CustomerHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-10 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <CustomerHistoryClient />
    </Suspense>
  );
}
