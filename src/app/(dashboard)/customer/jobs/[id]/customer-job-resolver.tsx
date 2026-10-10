"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { workOrdersService } from "@/services/work-orders.service";

export function CustomerJobResolver({ id }: { id: string }) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["customer-job-resolve", id],
    queryFn: () => workOrdersService.fetchWorkOrderById(id),
    staleTime: 60000,
  });

  const requestId = React.useMemo(() => {
    if (!data) return null;
    const rec = data as unknown as Record<string, unknown>;
    const srId = rec.serviceRequestId;
    if (typeof srId === "string" && srId) return srId;
    const req = rec.request as Record<string, unknown> | undefined;
    if (req && typeof req.id === "string" && req.id) return req.id;
    const rId = rec.requestId;
    if (typeof rId === "string" && rId) return rId;
    return null;
  }, [data]);

  React.useEffect(() => {
    if (requestId) {
      router.replace(`/customer/requests/${encodeURIComponent(requestId)}`);
    }
  }, [requestId, router]);

  if (isLoading || (data && requestId)) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary font-medium text-sm">
          <Loader2 className="size-4 animate-spin" />
          <span>Opening your job...</span>
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="border-border shadow-xs text-center p-6 space-y-3">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="size-8 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              We could not open this job
            </h3>
            <p className="text-xs text-muted-foreground">
              The requested work order could not be resolved to a service
              request.
            </p>
          </div>
          <Link
            href="/customer/requests"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "text-xs font-semibold",
            )}
          >
            Go to Service Requests
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
