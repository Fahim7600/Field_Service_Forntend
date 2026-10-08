import type { Metadata } from "next";
import { Suspense } from "react";

import { DispatchQueueClient } from "@/components/admin/dispatch-queue-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Dispatch Queue | Admin Dashboard",
  description: "Review incoming service requests and dispatch technicians.",
};

export default function AdminDispatchPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Dispatch Queue"
        description="Review customer requests, manage SLA priorities, and schedule work orders."
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <DispatchQueueClient />
      </Suspense>
    </Container>
  );
}
