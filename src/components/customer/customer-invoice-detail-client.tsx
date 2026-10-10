"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Loader2,
  Lock,
  Receipt,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { DetailNotFound } from "@/components/shared/detail-not-found";

import { InvoiceBreakdown } from "@/components/shared/invoice-breakdown";
import { QueryError } from "@/components/shared/query-error";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiError } from "@/lib/api-client";
import { formatMoney, safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { isSafeCheckoutUrl, redirectToCheckout } from "@/lib/stripe-redirect";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { Invoice } from "@/types/api";

interface CustomerInvoiceDetailClientProps {
  id: string;
}

export function CustomerInvoiceDetailClient({
  id,
}: CustomerInvoiceDetailClientProps) {
  const queryClient = useQueryClient();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Invoice>({
    queryKey: ["customer", "invoices", id],
    queryFn: () => financeService.fetchInvoiceById(id),
    staleTime: 10000,
  });

  // Re-enable payment button if user returns via browser Back button
  React.useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setIsRedirecting(false);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // Initiate Stripe Payment Mutation
  const payMutation = useMutation({
    meta: { silent: true },
    mutationFn: async () => {
      setIsRedirecting(true);
      return financeService.initiatePayment(id);
    },
    onSuccess: (data) => {
      const targetUrl = data.url;

      if (!targetUrl || !isSafeCheckoutUrl(targetUrl)) {
        setIsRedirecting(false);
        notify.error(
          "Could not start checkout",
          "Payment link was invalid. Please try again.",
        );
        return;
      }

      notify.info(
        messages.payments.redirectingToStripe.title,
        messages.payments.redirectingToStripe.description,
      );
      // Safely transition window to verified Stripe Checkout domain
      redirectToCheckout(targetUrl);
    },
    onError: (err: unknown) => {
      setIsRedirecting(false);
      notify.fromError(err, "Payment initiation failed");
      // Refetch invoice in case status changed (e.g., already paid or voided)
      queryClient.invalidateQueries({
        queryKey: ["customer", "invoices", id],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <DetailNotFound
          title="Invoice not found"
          description="We could not find the requested invoice or you do not have permission to view it."
          backHref="/customer/invoices"
          backLabel="Back to Invoices"
        />
      );
    }
    return (
      <div className="max-w-md mx-auto py-12">
        <QueryError
          error={error}
          onRetry={refetch}
          title="Unable to load invoice"
        />
      </div>
    );
  }

  const status = String(invoice.status).toUpperCase();
  const isUnpaid = status === "ISSUED";
  const isPaid = status === "PAID";
  const isVoid = status === "VOID";
  const isCancelled = status === "CANCELLED";
  const isRefunded = status === "REFUNDED";

  const isBusy = payMutation.isPending || isRedirecting;

  const workOrderId =
    invoice.workOrderId ||
    invoice.workOrder?.id ||
    invoice.workOrder?.serviceRequestId;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/customer/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Invoices</span>
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground font-heading">
              {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
            </h1>
            <StatusBadge
              status={invoice.status}
              label={invoice.status === "ISSUED" ? "Unpaid" : undefined}
            />
          </div>
        </div>

        <Link
          href="/contact"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <HelpCircle className="size-3.5" />
          <span>Need help? Contact support</span>
        </Link>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Line Items Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <InvoiceBreakdown invoice={invoice} />

          {/* Notes if provided */}
          {invoice.notes && (
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-2 border-b border-border">
                <CardTitle className="text-xs font-bold text-foreground">
                  Invoice Remarks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {invoice.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Payment Actions & Metadata */}
        <div className="space-y-6">
          {/* Payment Action Card */}
          {isUnpaid && (
            <Card className="border-border shadow-md ring-1 ring-primary/10 overflow-hidden">
              <div className="h-1.5 bg-brand-500 w-full" />
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="size-4 text-brand-600 shrink-0" />
                  <span>Settle Balance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Review invoice total and pay securely via Stripe.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4 text-xs">
                <div className="p-4 bg-muted/40 rounded-xl border border-border/80 text-center space-y-1">
                  <span className="text-[11px] uppercase font-semibold text-muted-foreground block">
                    Amount Due
                  </span>
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
                    {formatMoney(invoice.totalCents)}
                  </p>
                  {invoice.dueDate && (
                    <p className="text-[11px] text-muted-foreground pt-1">
                      Due by {safeFormatDate(invoice.dueDate)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={() => payMutation.mutate()}
                    disabled={isBusy}
                    className="w-full gap-2 text-sm font-bold shadow-sm h-11"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Redirecting to secure checkout...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="size-4" />
                        <span>Pay {formatMoney(invoice.totalCents)}</span>
                      </>
                    )}
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    You will be redirected to Stripe&apos;s secure checkout.
                    <br />
                    <span className="font-mono text-[10px]">
                      Test mode: use card 4242 4242 4242 4242
                    </span>
                  </p>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/20 border-t border-border px-5 py-3 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>256-bit encrypted SSL checkout</span>
              </CardFooter>
            </Card>
          )}

          {isPaid && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs">
              <CardContent className="p-5 space-y-3.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                  <span>Invoice Paid in Full</span>
                </div>
                <p className="text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                  Thank you! This invoice was successfully settled on{" "}
                  <span className="font-semibold">
                    {invoice.paidAt
                      ? safeFormatDateTime(invoice.paidAt)
                      : "record"}
                  </span>
                  .
                </p>

                {/* Receipt block */}
                <div className="p-3 bg-background/80 rounded-lg border border-emerald-500/20 space-y-1.5">
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-bold text-foreground">
                      {formatMoney(invoice.totalCents)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>Receipt:</span>
                    <span className="font-mono text-foreground">
                      {invoice.invoiceNumber || invoice.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href="/customer/payments"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full gap-1.5 text-xs font-semibold bg-background hover:bg-muted",
                    )}
                  >
                    <Receipt className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>View in Payment History</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {isRefunded && (
            <Card className="border-purple-500/30 bg-purple-500/5 shadow-xs">
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-bold text-sm">
                  <RotateCcw className="size-5 text-purple-600 shrink-0" />
                  <span>Payment Refunded</span>
                </div>
                <p className="text-purple-700/90 dark:text-purple-400/90 leading-relaxed">
                  The payment for this invoice was refunded to your original
                  payment method.
                </p>
                <div className="pt-1">
                  <Link
                    href="/customer/payments"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-full gap-1.5 text-xs font-semibold bg-background hover:bg-muted",
                    )}
                  >
                    <Receipt className="size-3.5 text-purple-600 dark:text-purple-400" />
                    <span>View Payment History</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {(isVoid || isCancelled) && (
            <Card className="border-border bg-muted/40 shadow-xs">
              <CardContent className="p-5 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                  <XCircle className="size-4 text-destructive shrink-0" />
                  <span>Invoice {status}</span>
                </div>
                <p>
                  This invoice is closed and no longer requires payment. If you
                  have questions, please reach out to customer support.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Details & References Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs font-bold text-foreground">
                Job &amp; Billing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {workOrderId && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Associated Service Job
                  </span>
                  <Link
                    href={`/customer/requests/${workOrderId}`}
                    className="inline-flex items-center gap-1.5 font-mono text-primary font-semibold hover:underline"
                  >
                    <span>
                      WO #
                      {invoice.workOrder?.workOrderNumber ||
                        workOrderId.slice(0, 8)}
                    </span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Issued Date:</span>
                  <span className="font-medium text-foreground">
                    {safeFormatDate(invoice.issuedAt || invoice.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Due Date:</span>
                  <span className="font-medium text-foreground">
                    {invoice.dueDate ? safeFormatDate(invoice.dueDate) : "—"}
                  </span>
                </div>

                {invoice.paidAt && (
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Paid Date:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {safeFormatDate(invoice.paidAt)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
