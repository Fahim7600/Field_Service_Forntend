import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSubscriptionsLoading() {
  return (
    <Container className="py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <div className="h-14 w-full bg-card rounded-xl border border-border animate-pulse" />

      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </Container>
  );
}
