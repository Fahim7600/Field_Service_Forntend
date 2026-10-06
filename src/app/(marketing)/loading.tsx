import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Hero-like skeleton block */}
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-6 w-36 rounded-full" />
        <Skeleton className="h-10 w-full sm:w-3/4 rounded-lg" />
        <Skeleton className="h-5 w-2/3 rounded-lg" />
      </div>

      {/* Feature / Banner skeleton */}
      <Skeleton className="h-44 w-full rounded-xl" />

      {/* 3 Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Static loading placeholder
          <Card key={i} className="border border-border shadow-xs">
            <CardHeader className="space-y-3">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-6 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-9 w-full rounded-lg mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
