"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CustomerHistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer History Error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="border-border/60 text-center p-8">
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
          <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              Failed to load service history
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {error.message ||
                "An unexpected error occurred while fetching your past jobs."}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Link
              href="/customer"
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
            >
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="size-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
