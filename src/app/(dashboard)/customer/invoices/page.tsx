import { CreditCard } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CustomerInvoicesClient } from "@/components/customer/customer-invoices-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Invoices & Billing | Customer Portal",
  description:
    "View service invoices, receipts, breakdown of charges, and pay online with Stripe.",
};

export default function CustomerInvoicesPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Invoices & Billing"
        description="Review itemized billing for your completed service requests and settle payments securely online."
        actions={
          <Link
            href="/customer/payments"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 text-xs font-semibold",
            )}
          >
            <CreditCard className="size-3.5" />
            <span>View payment history</span>
          </Link>
        }
      />

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
        <CustomerInvoicesClient />
      </Suspense>
    </Container>
  );
}
