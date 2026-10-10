import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianAnalyticsLoading() {
  return (
    <Container className="py-6 space-y-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </Container>
  );
}
