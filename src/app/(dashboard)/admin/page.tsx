import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminDashboardClient } from "@/components/admin/admin-dashboard-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Dashboard | Operational Overview",
  description:
    "Operational overview, revenue tracking, dispatch metrics, and workforce statistics.",
};

export default function AdminDashboardPage() {
  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 rounded-xl lg:col-span-2" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        <AdminDashboardClient />
      </Suspense>
    </Container>
  );
}
