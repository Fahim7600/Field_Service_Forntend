import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container className="py-6 space-y-6 max-w-2xl">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-xl" />
    </Container>
  );
}
