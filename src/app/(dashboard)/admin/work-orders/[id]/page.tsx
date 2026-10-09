import type { Metadata } from "next";
import { Suspense } from "react";

import { WorkOrderDetailClient } from "@/components/admin/work-order-detail-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Work Order #${id.slice(0, 8)} | Admin Dashboard`,
    description:
      "View work order details, assigned technician, and status history.",
  };
}

export default async function AdminWorkOrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Container className="py-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        <WorkOrderDetailClient id={id} />
      </Suspense>
    </Container>
  );
}
