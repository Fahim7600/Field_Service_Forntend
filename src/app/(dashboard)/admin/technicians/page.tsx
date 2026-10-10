import type { Metadata } from "next";
import { Suspense } from "react";

import { TechniciansClient } from "@/components/admin/technicians-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Field Technicians | Admin Console",
  description:
    "Review technician availability, assigned work history, rating scores, and performance analytics.",
};

export default function AdminTechniciansPage() {
  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-48 bg-muted rounded animate-pulse" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          </div>
        }
      >
        <TechniciansClient />
      </Suspense>
    </Container>
  );
}
