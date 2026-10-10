import type { Metadata } from "next";
import { Suspense } from "react";

import { AuditLogsClient } from "@/components/admin/audit-logs-client";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Audit Logs | Admin",
  description: "Who changed what, and when.",
};

function AuditLogsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <Container className="py-6 space-y-6">
      <PageHeader title="Audit logs" description="Who changed what, and when" />

      <Suspense fallback={<AuditLogsLoadingFallback />}>
        <AuditLogsClient />
      </Suspense>
    </Container>
  );
}
