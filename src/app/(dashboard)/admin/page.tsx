import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminAnalyticsDashboard } from "@/components/admin/admin-analytics-dashboard";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Command Center & Analytics",
  description:
    "Comprehensive operational overview, revenue tracking, dispatch queue, and platform analytics.",
};

export default function AdminDashboardPage() {
  return (
    <Container className="py-6 space-y-6">
      <DashboardWelcomeHeader
        title="Admin Command Center"
        description="Comprehensive operational overview, revenue telemetry, dispatch queue, and workforce management."
      />

      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-88 rounded-xl" />
              <Skeleton className="h-88 rounded-xl" />
            </div>
          </div>
        }
      >
        <AdminAnalyticsDashboard />
      </Suspense>
    </Container>
  );
}
