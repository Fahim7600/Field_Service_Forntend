import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerLoading() {
  return (
    <Container className="py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </Container>
  );
}
