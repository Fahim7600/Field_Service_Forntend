import type { Metadata } from "next";
import { Suspense } from "react";

import { RequestReviewClient } from "@/components/admin/request-review-client";
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
    title: `Review Request #${id.slice(0, 8)} | Admin Dispatch`,
    description: "Review request details, approve or reject service requests.",
  };
}

export default async function AdminDispatchReviewPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Container className="py-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        <RequestReviewClient id={id} />
      </Suspense>
    </Container>
  );
}
