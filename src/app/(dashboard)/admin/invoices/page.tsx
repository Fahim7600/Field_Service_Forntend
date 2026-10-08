import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminInvoicesClient } from "@/components/admin/admin-invoices-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Invoices & Billing | Admin Dashboard",
  description:
    "Manage customer billing, create invoices for completed jobs, and issue draft invoices.",
};

export default function AdminInvoicesPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Invoices & Billing"
        description="Review customer billing statements, generate draft invoices for completed work, and manage payment statuses."
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <AdminInvoicesClient />
      </Suspense>
    </Container>
  );
}
