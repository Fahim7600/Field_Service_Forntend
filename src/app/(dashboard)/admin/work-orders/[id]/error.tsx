"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminWorkOrderDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Admin work order detail error boundary:", error);
  }, [error]);

  return (
    <Container className="py-12">
      <Card className="border-destructive/30 bg-destructive/5 max-w-lg mx-auto shadow-xs text-center p-8">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-destructive">
              Failed to load work order details
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An unexpected error occurred while loading this work order."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/work-orders"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Work Orders</span>
            </Link>
            <Button size="sm" onClick={() => reset()} className="gap-1.5">
              <RefreshCw className="size-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
