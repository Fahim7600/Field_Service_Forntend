"use client";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Logo } from "@/components/shared/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-charcoal-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="mb-6">
        <Logo />
      </div>

      <Card className="max-w-md w-full text-center border-border shadow-lg bg-card overflow-hidden">
        <div className="h-1.5 bg-destructive w-full" />
        <CardHeader className="pt-8 pb-4 space-y-4">
          <div className="mx-auto size-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive ring-8 ring-destructive/5">
            <AlertTriangle className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-destructive bg-destructive/10 px-2.5 py-0.5 rounded-full inline-block">
              Application Error
            </span>
            <CardTitle className="text-2xl font-bold font-heading text-foreground">
              Something went wrong
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              An unexpected error occurred while rendering this view. Our
              engineering team has been notified.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-6 pt-0">
          {isDev && error?.message && (
            <div className="text-left bg-charcoal-900 text-charcoal-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto border border-charcoal-800">
              <p className="text-rose-400 font-semibold mb-1">
                Development Diagnostics:
              </p>
              <p className="break-all">{error.message}</p>
              {error.digest && (
                <p className="text-charcoal-400 mt-1 text-[10px]">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="default"
            onClick={reset}
            className="w-full sm:w-auto gap-2 font-semibold"
          >
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </Button>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto gap-2",
            )}
          >
            <Home className="size-4" />
            <span>Go to Home</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
