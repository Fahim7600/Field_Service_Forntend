import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkOrdersClient } from "@/components/admin/work-orders-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Work Orders | Admin Dashboard",
  description: "Monitor and manage all field service work orders.",
};

export default function AdminWorkOrdersPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Work Orders"
        description="Track all customer service work orders, assigned technicians, and execution statuses."
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <WorkOrdersClient />
      </Suspense>
    </Container>
  );
}
