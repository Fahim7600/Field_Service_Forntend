import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { TechnicianTasksClient } from "@/components/technician/technician-tasks-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "My Tasks & Work Orders | Technician Dashboard",
  description:
    "View and execute assigned field service tasks, track arrival and complete service reports.",
};

export default function TechnicianTasksPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Assigned Tasks"
        description="Review assigned work orders, update live visit statuses, and submit completion reports."
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <TechnicianTasksClient />
      </Suspense>
    </Container>
  );
}
