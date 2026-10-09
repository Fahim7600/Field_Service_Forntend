import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountDetailsForm } from "@/components/forms/account-details-form";
import { SecurityCard } from "@/components/forms/security-card";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Profile & Credentials | Field Service",
  description:
    "Manage administrator profile, contact information, and security credentials.",
};

export default function AdminProfilePage() {
  return (
    <Container className="py-6 space-y-6 max-w-2xl">
      <PageHeader
        title="Admin Profile & Settings"
        description="Update your administrator account details, email, and authentication credentials."
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        }
      >
        <div className="space-y-6">
          <AccountDetailsForm />
          <SecurityCard />
        </div>
      </Suspense>
    </Container>
  );
}
