import type { Metadata } from "next";
import { Suspense } from "react";
import { TechnicianScheduleClient } from "@/components/technician/technician-schedule-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Schedule | Technician Portal",
  description: "View scheduled service visits and route timeline.",
};

export default function TechnicianSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <TechnicianScheduleClient />
    </Suspense>
  );
}
