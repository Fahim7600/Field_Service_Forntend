import type { Metadata } from "next";
import { Suspense } from "react";
import { TechnicianProfileClient } from "@/components/technician/technician-profile-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Technician Profile & Settings | Field Service",
  description:
    "Manage technician account profile, working hours, and certified skills.",
};

export default function TechnicianProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      }
    >
      <TechnicianProfileClient />
    </Suspense>
  );
}
