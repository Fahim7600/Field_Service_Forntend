import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceReportClient } from "@/components/technician/service-report-client";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Service Report #${id.slice(0, 8)} | Technician`,
    description: "Submit service report and work completion documentation.",
  };
}

export default async function TechnicianReportPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="container max-w-4xl py-6 space-y-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <ServiceReportClient id={id} />
    </Suspense>
  );
}
