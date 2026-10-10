import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminUsersClient } from "@/components/admin/admin-users-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description:
    "People register as customers. Promote a user to Technician or Admin here after they sign up.",
};

function UsersLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="User management"
        description="People register as customers. Promote a user to Technician or Admin here after they sign up."
      />

      <Suspense fallback={<UsersLoadingFallback />}>
        <AdminUsersClient />
      </Suspense>
    </Container>
  );
}
