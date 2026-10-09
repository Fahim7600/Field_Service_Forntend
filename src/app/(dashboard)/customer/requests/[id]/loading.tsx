import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function RequestDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Skeleton className="h-5 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
            <Skeleton className="h-28 w-full rounded-xl" />
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border-border p-4 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
