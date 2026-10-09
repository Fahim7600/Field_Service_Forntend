import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
