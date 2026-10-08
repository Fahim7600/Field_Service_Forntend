import { ArrowLeft, Home, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Field Service",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-charcoal-900 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="mb-6">
        <Logo />
      </div>

      <Card className="max-w-md w-full text-center border-border shadow-lg bg-card overflow-hidden">
        <div className="h-1.5 bg-brand-500 w-full" />
        <CardHeader className="pt-8 pb-4 space-y-4">
          <div className="mx-auto size-16 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-400 ring-8 ring-brand-500/5">
            <SearchX className="size-8" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full inline-block">
              404 • Not Found
            </span>
            <CardTitle className="text-2xl font-bold font-heading text-foreground">
              Page Not Found
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Sorry, we couldn’t find the page or resource you’re looking for.
              It might have been moved or doesn’t exist.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pb-6 pt-2">
          <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground">
            Need immediate assistance? You can return to your portal dashboard
            or contact our technical support.
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 font-semibold text-primary-foreground",
            )}
          >
            <Home className="size-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full sm:w-auto gap-2",
            )}
          >
            <ArrowLeft className="size-4" />
            <span>Contact Support</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
