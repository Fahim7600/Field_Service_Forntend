import { ArrowLeft, FileText, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

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
  title: "Payment Cancelled | Field Service",
  description: "The payment process was cancelled.",
};

export default function PaymentCancelPage() {
  return (
    <Card className="border-border bg-card shadow-lg text-center overflow-hidden">
      <div className="h-2 bg-amber-500 w-full" />
      <CardHeader className="pt-8 pb-4 space-y-4">
        <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
          <XCircle className="size-10" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-bold text-foreground font-heading">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
            You cancelled the checkout process. No charges were made to your
            account.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-6 text-xs text-muted-foreground border-y border-border/60 py-4 bg-muted/20">
        <p>
          If you experienced any issues or have questions about your invoice,
          please contact support.
        </p>
      </CardContent>

      <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full sm:w-auto gap-2",
          )}
        >
          <ArrowLeft className="size-4" />
          <span>Go Back</span>
        </Link>
        <Link
          href="/customer/invoices"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
          )}
        >
          <FileText className="size-4" />
          <span>Return to Invoices</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
