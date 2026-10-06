"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error captured by error boundary:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shadow-xs">
          <AlertTriangle className="size-10" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold tracking-widest uppercase text-destructive bg-destructive/10 px-3 py-1 rounded-full">
            System Error
          </span>
          <h1 className="text-3xl font-extrabold text-charcoal-900 tracking-tight sm:text-4xl">
            Something went wrong
          </h1>
          <p className="text-sm text-charcoal-600 leading-relaxed">
            An unexpected error occurred while processing your request. Our
            technical team has been notified.
          </p>
        </div>

        {isDev && error?.message && (
          <div className="text-left bg-charcoal-900 text-ash p-4 rounded-lg font-mono text-xs overflow-x-auto border border-charcoal-800">
            <p className="text-destructive font-semibold mb-1">
              Development Error Details:
            </p>
            <p className="text-white">{error.message}</p>
            {error.digest && (
              <p className="text-ash/70 mt-1">Digest: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="default"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="size-4 mr-2" />
            Try again
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto",
            )}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
