"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarketingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    // Log error to console for diagnostic monitoring
    console.error("Marketing route error:", error);
  }, [error]);

  return (
    <div className="py-24 sm:py-32 max-w-xl mx-auto px-4 text-center">
      <div className="p-8 sm:p-10 rounded-3xl border border-border bg-card shadow-lg space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            We encountered an unexpected error while loading this page. You can
            try reloading or return to the home page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="default"
            onClick={reset}
            className="w-full sm:w-auto font-semibold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
