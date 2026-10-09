"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import * as React from "react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminInvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Admin Invoices Error Boundary:", error);
  }, [error]);

  return (
    <Container className="py-12">
      <Card className="max-w-md mx-auto border-destructive/30 bg-destructive/5 text-center p-6 space-y-4">
        <CardContent className="space-y-3 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-destructive">
              Failed to load invoices
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An unexpected error occurred while loading billing data."}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => reset()}
            className="gap-2 text-xs font-semibold"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
