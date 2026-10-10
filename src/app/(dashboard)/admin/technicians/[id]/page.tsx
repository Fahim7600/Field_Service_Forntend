import type { Metadata } from "next";
import { Suspense } from "react";

import { TechnicianAnalyticsClient } from "@/components/admin/technician-analytics-client";
import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Technician Analytics (${id.slice(0, 8)}) | Admin Console`,
    description:
      "Detailed performance telemetry, job completions, ratings, and customer feedback.",
  };
}

export default async function TechnicianAnalyticsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Container className="py-6 space-y-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        }
      >
        <TechnicianAnalyticsClient id={id} />
      </Suspense>
    </Container>
  );
}
