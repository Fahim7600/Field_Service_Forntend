import type { Metadata } from "next";
import { Suspense } from "react";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Notifications | Admin Dispatcher",
  description: "View system alerts, request approvals, and operation notices.",
};

export default function AdminNotificationsPage() {
  return (
    <Container className="py-6">
      <Suspense
        fallback={
          <div className="space-y-4 max-w-4xl mx-auto">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-80" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl" />
              ))}
            </div>
          </div>
        }
      >
        <NotificationsPageClient userRole="ADMIN" />
      </Suspense>
    </Container>
  );
}
