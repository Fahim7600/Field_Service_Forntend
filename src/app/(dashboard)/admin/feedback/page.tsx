import type { Metadata } from "next";
import { Suspense } from "react";

import { FeedbackClient } from "@/components/admin/feedback-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Customer Feedback | Admin",
  description: "Ratings and comments after completed jobs.",
};

function FeedbackLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Customer feedback"
        description="Ratings and comments after completed jobs"
      />

      <Suspense fallback={<FeedbackLoadingFallback />}>
        <FeedbackClient />
      </Suspense>
    </Container>
  );
}
