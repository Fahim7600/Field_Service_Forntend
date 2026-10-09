import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/shared/container";
import { TechnicianOverviewClient } from "@/components/technician/technician-overview-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Technician Overview | Field Service",
  description:
    "Field service technician operations overview, active assignments, and visit schedule.",
};

export default function TechnicianOverviewPage() {
  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-60" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        }
      >
        <TechnicianOverviewClient />
      </Suspense>
    </Container>
  );
}
