import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCatalogLoading() {
  return (
    <Container className="py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />

      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
