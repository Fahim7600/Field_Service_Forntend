"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminCatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Catalog Error:", error);
  }, [error]);

  return (
    <Container className="py-12">
      <Card className="max-w-md mx-auto border-destructive/30 bg-destructive/5 text-center p-6">
        <CardContent className="space-y-4 p-0">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              Failed to load service catalog
            </h2>
            <p className="text-xs text-muted-foreground">
              {error.message ||
                "An error occurred while loading the service catalog."}
            </p>
          </div>
          <Button onClick={() => reset()} size="sm" variant="outline">
            <RefreshCw className="size-3.5 mr-1.5" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
