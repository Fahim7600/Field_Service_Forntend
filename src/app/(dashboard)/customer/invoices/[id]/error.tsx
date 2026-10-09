"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Container } from "@/components/shared/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function CustomerInvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Customer Invoice Detail Error Boundary:", error);
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
              Failed to load invoice
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "Unable to retrieve this invoice's details and payment information."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              href="/customer/invoices"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-semibold",
              )}
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Invoices</span>
            </Link>
            <Button
              size="sm"
              onClick={() => reset()}
              className="gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
