import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminInvoiceDetailClient } from "@/components/admin/admin-invoice-detail-client";
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
    title: `Invoice #${id.slice(0, 8)} | Admin Billing`,
    description:
      "Review line items, labor, parts breakdown, and issue invoices to customers.",
  };
}

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
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
        <AdminInvoiceDetailClient id={id} />
      </Suspense>
    </Container>
  );
}
