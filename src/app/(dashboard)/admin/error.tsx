"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin section error:", error);
  }, [error]);

  return (
    <Container className="py-12 max-w-lg">
      <Card className="border-border shadow-xs">
        <CardContent className="p-8 text-center space-y-4">
          <div className="size-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">
              Something went wrong in this section
            </h2>
            <p className="text-xs text-muted-foreground">
              {process.env.NODE_ENV === "development" && error.message
                ? error.message
                : "An unexpected error occurred while loading this admin console section."}
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Admin Dashboard
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
