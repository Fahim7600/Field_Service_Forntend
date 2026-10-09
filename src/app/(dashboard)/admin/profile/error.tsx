"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/container";
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
    <Container className="py-12 max-w-lg">
      <Card className="border-border">
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Unable to load admin profile
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An unexpected error occurred while loading your administrator settings."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Back to dashboard
            </Link>
            <Button variant="default" size="sm" onClick={reset}>
              <RefreshCw className="size-3.5 mr-2" />
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
