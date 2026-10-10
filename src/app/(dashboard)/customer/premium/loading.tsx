import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerPremiumLoading() {
  return (
    <Container className="py-8">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </Container>
  );
}
