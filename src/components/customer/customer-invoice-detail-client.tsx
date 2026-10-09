"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { getErrorMessage } from "@/lib/api-client";
import { formatCurrencyCents } from "@/lib/format-currency";
import { formatSafeDate, formatSafeDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { InvoiceDetail, InvoiceItem } from "@/types/api";

interface CustomerInvoiceDetailClientProps {
  id: string;
}

export function CustomerInvoiceDetailClient({
  id,
}: CustomerInvoiceDetailClientProps) {
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<InvoiceDetail>({
    queryKey: ["customer-invoice", id],
    queryFn: () => financeService.fetchInvoiceById(id),
    staleTime: 10000,
  });

  const payMutation = useMutation({
    mutationFn: async () => financeService.initiatePayment({ invoiceId: id }),
    onMutate: () => {
      setIsRedirecting(true);
    },
    onSuccess: (res) => {
      const redirectUrl = res.url || res.checkoutUrl || res.paymentUrl;
      if (redirectUrl) {
        toast.info("Redirecting to secure Stripe Checkout...");
        window.location.href = redirectUrl;
      } else {
        setIsRedirecting(false);
        toast.error("Checkout URL was not returned by the payment server.");
      }
    },
    onError: (err) => {
      setIsRedirecting(false);
      toast.error(getErrorMessage(err));
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
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <Card className="border-destructive/40 bg-destructive/5 p-6 text-center">
        <CardContent className="space-y-3 p-0">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load invoice details
            </h3>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The invoice could not be found."}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/customer/invoices"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Invoices</span>
            </Link>
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const isIssued = invoice.status === "ISSUED";
  const isPaid = invoice.status === "PAID";
  const isVoid = invoice.status === "VOID";

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/invoices"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "rounded-lg",
            )}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to Invoices</span>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-lg font-bold text-foreground">
                Invoice #{invoice.invoiceNumber || invoice.id.slice(0, 8)}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Issued{" "}
              {invoice.issuedAt ? formatSafeDate(invoice.issuedAt) : "Pending"}{" "}
              • Linked Work Order #{invoice.workOrder?.id?.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Line items breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 bg-panel/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <span>Service Breakdown & Items</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-charcoal-600">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Type</th>
                      <th className="px-4 py-2.5 font-semibold">Description</th>
                      <th className="px-4 py-2.5 font-semibold text-right">
                        Qty
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-right">
                        Unit Price
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(invoice.items || []).map(
                      (item: InvoiceItem, idx: number) => (
                        <tr
                          key={item.id || item.description + idx}
                          className="hover:bg-muted/20"
                        >
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] uppercase font-mono"
                            >
                              {item.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {item.description}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                            {formatCurrencyCents(
                              item.unitAmountCents,
                              invoice.currency,
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right font-semibold font-mono text-foreground">
                            {formatCurrencyCents(
                              item.amountCents ??
                                item.quantity * item.unitAmountCents,
                              invoice.currency,
                            )}
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* Financial Summary */}
            <CardFooter className="border-t border-border bg-panel/50 p-4 flex flex-col items-end gap-1.5 text-xs">
              <div className="w-full sm:w-64 space-y-1.5">
                {(invoice.laborCents ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Labor Charges:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.laborCents ?? 0,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {(invoice.partsCents ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Parts & Materials:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.partsCents ?? 0,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {(invoice.extraCents ?? 0) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Extra Fees:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.extraCents ?? 0,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {invoice.discountCents > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Premium Discount:</span>
                    <span className="font-mono">
                      -
                      {formatCurrencyCents(
                        invoice.discountCents,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {invoice.taxCents > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(invoice.taxCents, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Due:</span>
                  <span className="font-mono text-base text-primary">
                    {formatCurrencyCents(invoice.totalCents, invoice.currency)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Payment Card */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-panel/50 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Payment & Settlement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {isPaid && (
                <div className="space-y-4 text-center">
                  <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Invoice Paid
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Settled on {formatSafeDateTime(invoice.paidAt)}
                    </p>
                  </div>
                  <Alert variant="success" className="text-xs text-left">
                    <ShieldCheck className="size-4" />
                    <AlertTitle>Secure Transaction</AlertTitle>
                    <AlertDescription>
                      This invoice was settled safely. Thank you for your
                      business!
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {isIssued && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Amount Due
                      </span>
                      <span className="text-lg font-mono font-bold text-foreground">
                        {formatCurrencyCents(
                          invoice.totalCents,
                          invoice.currency,
                        )}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Lock className="size-3" />
                      Encrypted and processed securely by Stripe
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-sm font-semibold text-sm h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={payMutation.isPending || isRedirecting}
                    onClick={() => payMutation.mutate()}
                  >
                    {payMutation.isPending || isRedirecting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Connecting to Stripe Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="size-4" />
                        <span>
                          Pay with Stripe (
                          {formatCurrencyCents(
                            invoice.totalCents,
                            invoice.currency,
                          )}
                          )
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isDraft && (
                <Alert variant="warning" className="text-xs">
                  <Clock className="size-4" />
                  <AlertTitle>Draft Pending</AlertTitle>
                  <AlertDescription>
                    This invoice is currently being reviewed by our billing
                    team. You will be notified once it is issued for payment.
                  </AlertDescription>
                </Alert>
              )}

              {isVoid && (
                <Alert variant="destructive" className="text-xs">
                  <AlertCircle className="size-4" />
                  <AlertTitle>Voided</AlertTitle>
                  <AlertDescription>
                    This invoice has been voided. No payment is required.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
