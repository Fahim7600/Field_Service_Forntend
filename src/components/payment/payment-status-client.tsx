"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  FileText,
  Home,
  Info,
  Loader2,
  LogIn,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePaymentVerification } from "@/hooks/use-payment-verification";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

interface PaymentStatusClientProps {
  sessionId: string | null;
}

export function PaymentStatusClient({ sessionId }: PaymentStatusClientProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { state, data, refetch } = usePaymentVerification({ sessionId });

  const roleHome =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "TECHNICIAN"
        ? "/technician"
        : "/customer";

  const isLoggedIn = Boolean(user);

  // When payment is confirmed, invalidate invoice and work order queries
  React.useEffect(() => {
    if (state === "paid") {
      queryClient.invalidateQueries({ queryKey: ["customer", "invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    }
  }, [state, queryClient]);

  const invoiceId = data?.invoiceId;
  const invoiceNumber = data?.invoiceNumber;
  const amountCents = data?.amountCents;

  const invoiceUrl = invoiceId
    ? `/customer/invoices/${invoiceId}`
    : "/customer/invoices";

  return (
    <Card className="border-border bg-card shadow-lg text-center overflow-hidden">
      {/* Top Banner Indicator */}
      <div
        className={cn(
          "h-2 w-full transition-colors",
          state === "paid" && "bg-emerald-500",
          state === "confirming" && "bg-brand-500 animate-pulse",
          state === "delayed" && "bg-amber-500",
          state === "failed" && "bg-destructive",
          state === "unknown" && "bg-muted-foreground/30",
        )}
      />

      <div aria-live="polite" className="contents">
        {/* State: Confirming / Polling */}
        {state === "confirming" && (
          <>
            <CardHeader className="pt-8 pb-4 space-y-4">
              <div className="size-16 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto ring-8 ring-brand-500/5">
                <Loader2 className="size-8 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                  Confirming Payment...
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Please hold on while we verify your transaction status with
                  Stripe.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="py-4 text-xs text-muted-foreground border-y border-border/60 bg-muted/20">
              <p>This verification usually completes within a few seconds.</p>
            </CardContent>
          </>
        )}

        {/* State: Paid / Succeeded */}
        {state === "paid" && (
          <>
            <CardHeader className="pt-8 pb-4 space-y-4">
              <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                <CheckCircle2 className="size-10" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">
                  Payment Successful!
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you! Your payment has been securely processed and your
                  invoice is settled.
                </CardDescription>
              </div>
            </CardHeader>

            {(invoiceNumber || amountCents !== undefined) && (
              <CardContent className="space-y-2 py-4 text-xs text-muted-foreground border-y border-border/60 bg-muted/20">
                {invoiceNumber && (
                  <div className="flex justify-between items-center max-w-xs mx-auto">
                    <span className="text-muted-foreground">Invoice:</span>
                    <span className="font-mono font-bold text-foreground">
                      {invoiceNumber}
                    </span>
                  </div>
                )}
                {amountCents !== undefined && (
                  <div className="flex justify-between items-center max-w-xs mx-auto">
                    <span className="text-muted-foreground">Amount Paid:</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {formatMoney(amountCents)}
                    </span>
                  </div>
                )}
              </CardContent>
            )}

            <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href={invoiceUrl}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "w-full sm:w-auto gap-2 font-semibold shadow-xs",
                )}
              >
                <FileText className="size-4" />
                <span>View Invoice</span>
              </Link>
              <Link
                href={roleHome}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full sm:w-auto gap-2 font-medium",
                )}
              >
                <Home className="size-4" />
                <span>Return to Dashboard</span>
              </Link>
            </CardFooter>
          </>
        )}

        {/* State: Delayed Confirmation */}
        {state === "delayed" && (
          <>
            <CardHeader className="pt-8 pb-4 space-y-4">
              <div className="size-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
                <Clock className="size-8" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-bold text-foreground font-heading">
                  Payment Processing
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  We have not received confirmation from Stripe yet. This can
                  take a minute. Your card is only charged if the payment
                  succeeds.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="py-4 text-xs text-muted-foreground border-y border-border/60 bg-muted/20">
              <p>
                You can check the status again now or review your invoices
                portal.
              </p>
            </CardContent>

            <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Button
                variant="default"
                size="default"
                onClick={() => refetch()}
                className="w-full sm:w-auto gap-2 font-semibold"
              >
                <RefreshCw className="size-4" />
                <span>Check Again</span>
              </Button>
              <Link
                href={invoiceUrl}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full sm:w-auto gap-2 font-medium",
                )}
              >
                <FileText className="size-4" />
                <span>View Invoices</span>
              </Link>
            </CardFooter>
          </>
        )}

        {/* State: Failed */}
        {state === "failed" && (
          <>
            <CardHeader className="pt-8 pb-4 space-y-4">
              <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
                <XCircle className="size-10" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl sm:text-2xl font-bold text-destructive font-heading">
                  Payment Failed
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  The payment attempt could not be completed. No charges were
                  finalized on your account.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="py-4 text-xs text-muted-foreground border-y border-border/60 bg-muted/20">
              <p>
                Please verify your card details or try an alternative payment
                method.
              </p>
            </CardContent>

            <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
              <Link
                href={invoiceUrl}
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "w-full sm:w-auto gap-2 font-semibold",
                )}
              >
                <RefreshCw className="size-4" />
                <span>Try Again</span>
              </Link>
              <Link
                href={roleHome}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full sm:w-auto gap-2 font-medium",
                )}
              >
                <Home className="size-4" />
                <span>Dashboard</span>
              </Link>
            </CardFooter>
          </>
        )}

        {/* State: Unknown / Invalid Session ID */}
        {state === "unknown" && (
          <>
            <CardHeader className="pt-8 pb-4 space-y-4">
              <div className="size-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto ring-8 ring-muted/50">
                <Info className="size-8" />
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-xl font-bold text-foreground font-heading">
                  Payment Verification
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  We could not verify this payment session automatically. Open
                  your invoices dashboard to inspect current settlement status.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="py-4 text-xs text-muted-foreground border-y border-border/60 bg-muted/20">
              <p>
                If you were charged, your invoice status will reflect as Paid
                momentarily.
              </p>
            </CardContent>

            <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
              {isLoggedIn ? (
                <Link
                  href="/customer/invoices"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "w-full sm:w-auto gap-2 font-semibold",
                  )}
                >
                  <FileText className="size-4" />
                  <span>View Invoices</span>
                </Link>
              ) : (
                <Link
                  href="/login?redirect=%2Fcustomer%2Finvoices"
                  className={cn(
                    buttonVariants({ variant: "default", size: "default" }),
                    "w-full sm:w-auto gap-2 font-semibold",
                  )}
                >
                  <LogIn className="size-4" />
                  <span>Log in to view your invoice</span>
                </Link>
              )}
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "w-full sm:w-auto gap-2 font-medium",
                )}
              >
                <Home className="size-4" />
                <span>Home</span>
              </Link>
            </CardFooter>
          </>
        )}
      </div>
    </Card>
  );
}
