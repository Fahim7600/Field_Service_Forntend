import { CheckCircle2, FileText, Home } from "lucide-react";
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
  title: "Payment Successful | Field Service",
  description: "Your payment has been successfully processed via Stripe.",
};

export default function PaymentSuccessPage() {
  return (
    <Card className="border-border bg-card shadow-lg text-center overflow-hidden">
      <div className="h-2 bg-emerald-500 w-full" />
      <CardHeader className="pt-8 pb-4 space-y-4">
        <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-bold text-foreground font-heading">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
            Thank you for your payment. Your transaction has been completed
            safely and your account has been updated.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-6 text-xs text-muted-foreground border-y border-border/60 py-4 bg-muted/20">
        <p>
          A receipt has been generated and emailed to your registered address.
        </p>
      </CardContent>

      <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
          )}
        >
          <Home className="size-4" />
          <span>Return to Dashboard</span>
        </Link>
        <Link
          href="/customer/invoices"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full sm:w-auto gap-2",
          )}
        >
          <FileText className="size-4" />
          <span>View Invoices</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
