import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/shared/container";
import { TechnicianPerformanceClient } from "@/components/technician/technician-performance-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Performance | Technician Portal",
  description:
    "Review your completed service tasks, upcoming scheduled visits, hours logged, and job status distribution.",
};

export default function TechnicianPerformancePage() {
  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {["s1", "s2", "s3", "s4"].map((key) => (
                <Skeleton key={key} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        <TechnicianPerformanceClient />
      </Suspense>
    </Container>
  );
}
