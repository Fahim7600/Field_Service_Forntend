import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function TechnicianNotificationsLoading() {
  return (
    <Container className="py-6">
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-80" />
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    </Container>
  );
}
