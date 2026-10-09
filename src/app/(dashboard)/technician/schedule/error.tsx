"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-12">
      <Card className="border-border max-w-lg mx-auto">
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Unable to load schedule
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An unexpected error occurred while loading your schedule."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/technician/tasks"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View tasks
            </Link>
            <Button variant="default" size="sm" onClick={reset}>
              <RefreshCw className="size-3.5 mr-2" />
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
