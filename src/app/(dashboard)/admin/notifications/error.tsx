"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import * as React from "react";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminNotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Notifications error:", error);
  }, [error]);

  return (
    <Container className="py-12">
      <Card className="max-w-md mx-auto border-border bg-card shadow-xs text-center py-6">
        <CardHeader className="space-y-2 pb-4">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <CardTitle className="text-lg font-bold">
            Failed to load notifications
          </CardTitle>
          <CardDescription className="text-xs">
            {error.message ||
              "An unexpected error occurred while loading your notifications."}
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reset()}
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Try again
          </Button>
        </CardFooter>
      </Card>
    </Container>
  );
}
