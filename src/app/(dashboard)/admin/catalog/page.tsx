import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogClient } from "@/components/admin/catalog-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Service Catalog | Admin",
  description: "Service types and the skills technicians need for them.",
};

function CatalogLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminCatalogPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader
        title="Service catalog"
        description="Service types and the skills technicians need for them"
      />

      <Suspense fallback={<CatalogLoadingFallback />}>
        <CatalogClient />
      </Suspense>
    </Container>
  );
}
