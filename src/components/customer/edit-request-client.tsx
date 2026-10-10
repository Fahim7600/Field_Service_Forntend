"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { EditRequestForm } from "@/components/forms/edit-request-form";
import { DetailNotFound } from "@/components/shared/detail-not-found";
import { QueryError } from "@/components/shared/query-error";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isRequestEditable } from "@/lib/work-order-rules";
import { requestsService } from "@/services/requests.service";

interface EditRequestClientProps {
  id: string;
}

export function EditRequestClient({ id }: EditRequestClientProps) {
  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["customer-request", id],
    queryFn: () => requestsService.fetchRequestById(id),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const errStatus =
    (error as { statusCode?: number; status?: number })?.statusCode ||
    (error as { statusCode?: number; status?: number })?.status;
  if (!request && (errStatus === 404 || errStatus === 403)) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <DetailNotFound
          title="Request Not Found"
          description="We couldn't find this service request or you don't have permission to view it."
          backHref="/customer/requests"
          backLabel="Back to Requests"
        />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <QueryError
          error={error}
          onRetry={() => refetch()}
          title="Failed to load request"
        />
      </div>
    );
  }

  // Guard: Only SUBMITTED requests are editable
  if (!isRequestEditable(request.status)) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-border/60 text-center p-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lock className="size-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">
                This request can no longer be edited
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Service request #
                {request.requestNumber ||
                  request.id?.slice(0, 8) ||
                  id.slice(0, 8)}{" "}
                is in{" "}
                <span className="font-semibold text-foreground">
                  {request.status}
                </span>{" "}
                status and has already been processed by our dispatch team.
              </p>
            </div>
            <Link
              href={`/customer/requests/${request.id || id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "gap-2 mt-2",
              )}
            >
              <ArrowLeft className="size-4" />
              View Request Details
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <EditRequestForm request={request} />
    </div>
  );
}
