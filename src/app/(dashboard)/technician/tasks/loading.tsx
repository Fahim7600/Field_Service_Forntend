import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianTasksLoading() {
  return (
    <Container className="py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: Skeletons
            key={i}
            className="h-9 w-24 rounded-full shrink-0"
          />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </Container>
  );
}
