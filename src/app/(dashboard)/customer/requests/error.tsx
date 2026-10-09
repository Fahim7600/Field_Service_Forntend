"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RequestsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Customer requests section error:", error);
  }, [error]);

  return (
    <div className="py-8 max-w-xl mx-auto">
      <Card className="border-destructive/30 bg-card p-6 text-center shadow-xs">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              Failed to load service requests
            </h2>
            <p className="text-xs text-muted-foreground">
              {process.env.NODE_ENV === "development"
                ? error.message
                : "An unexpected error occurred while loading your service requests."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/customer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs",
              )}
            >
              <ArrowLeft className="size-3.5" />
              <span>Dashboard</span>
            </Link>
            <Button
              size="sm"
              onClick={() => reset()}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="size-3.5" />
              <span>Try again</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
