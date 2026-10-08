import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminUsersClient } from "@/components/admin/admin-users-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "User Management | Admin Command Center",
  description:
    "Manage platform users, customer accounts, technician permissions, and account statuses.",
};

export default function AdminUsersPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="User & Workforce Directory"
        description="Search platform accounts, reassign organizational roles, and manage access statuses."
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        }
      >
        <AdminUsersClient />
      </Suspense>
    </Container>
  );
}
