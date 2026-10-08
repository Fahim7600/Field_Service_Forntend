"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Receipt,
  Send,
  ShieldAlert,
  User,
} from "lucide-react";
import Link from "next/link";
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
import type { InvoiceDetail } from "@/types/api";

interface AdminInvoiceDetailClientProps {
  id: string;
}

export function AdminInvoiceDetailClient({
  id,
}: AdminInvoiceDetailClientProps) {
  const queryClient = useQueryClient();

  const {
    data: invoice,
    isLoading,
    isError,
    error,
  } = useQuery<InvoiceDetail>({
    queryKey: ["invoices", id],
    queryFn: () => financeService.fetchInvoiceById(id),
    staleTime: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => financeService.sendInvoice(id),
    onSuccess: async () => {
      toast.success("Invoice issued and sent to customer!");
      await queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err) => {
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
      <Card className="border-destructive/30 bg-destructive/5 p-6 text-center">
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
              href="/admin/invoices"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5",
              )}
            >
              <ArrowLeft className="size-4" />
              <span>Back to Invoices</span>
            </Link>
            <Button size="sm" onClick={() => window.location.reload()}>
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
            href="/admin/invoices"
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
              Created {formatSafeDate(invoice.createdAt)} • Linked Work Order #
              {invoice.workOrder?.id?.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Line Items & Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Billing Meta */}
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" />
                <span>Customer & Billing Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] block font-semibold">
                  Customer
                </span>
                <p className="font-semibold text-foreground text-sm">
                  {invoice.customer?.name || "Customer"}
                </p>
                {invoice.customer?.email && (
                  <p className="text-muted-foreground">
                    {invoice.customer.email}
                  </p>
                )}
              </div>
              <div>
                <span className="text-muted-foreground uppercase text-[10px] block font-semibold">
                  Issue / Due Dates
                </span>
                <p className="text-foreground">
                  Issued:{" "}
                  {invoice.issuedAt
                    ? formatSafeDate(invoice.issuedAt)
                    : "Not issued yet (Draft)"}
                </p>
                {invoice.paidAt && (
                  <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Paid: {formatSafeDateTime(invoice.paidAt)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line Items Table */}
          <Card className="border-border bg-card shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60 bg-panel/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <span>Line Items ({invoice.items?.length || 0})</span>
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
                    {(invoice.items || []).map((item, idx) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>

            {/* Financial Summary Breakdown */}
            <CardFooter className="border-t border-border bg-panel/50 p-4 flex flex-col items-end gap-1.5 text-xs">
              <div className="w-full sm:w-64 space-y-1.5">
                {invoice.laborCents > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Labor Charges:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.laborCents,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {invoice.partsCents > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Parts & Materials:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.partsCents,
                        invoice.currency,
                      )}
                    </span>
                  </div>
                )}
                {invoice.extraCents > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Extra Fees:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(
                        invoice.extraCents,
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
                    <span>Estimated Tax:</span>
                    <span className="font-mono">
                      {formatCurrencyCents(invoice.taxCents, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-1.5 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Amount:</span>
                  <span className="font-mono text-base text-primary">
                    {formatCurrencyCents(invoice.totalCents, invoice.currency)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/80 bg-panel/50 pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="size-4 text-primary" />
                <span>Invoice Action Center</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {isDraft && (
                <div className="space-y-3">
                  <Alert variant="warning" className="text-xs">
                    <Clock className="size-4" />
                    <AlertTitle>Draft State</AlertTitle>
                    <AlertDescription>
                      This invoice is currently in draft. Issue the invoice to
                      deliver the bill to the customer and enable Stripe payment
                      checkout.
                    </AlertDescription>
                  </Alert>

                  <Button
                    type="button"
                    className="w-full justify-center gap-2 shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={sendMutation.isPending}
                    onClick={() => sendMutation.mutate()}
                  >
                    {sendMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    <span>Issue Invoice & Send to Customer</span>
                  </Button>
                </div>
              )}

              {isIssued && (
                <Alert variant="info" className="text-xs">
                  <Send className="size-4 text-blue-600" />
                  <AlertTitle>Invoice Issued</AlertTitle>
                  <AlertDescription>
                    Invoice sent on {formatSafeDate(invoice.issuedAt)}. Awaiting
                    customer payment via Stripe.
                  </AlertDescription>
                </Alert>
              )}

              {isPaid && (
                <Alert variant="success" className="text-xs">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>Paid in Full</AlertTitle>
                  <AlertDescription>
                    Payment of{" "}
                    {formatCurrencyCents(invoice.totalCents, invoice.currency)}{" "}
                    was settled successfully.
                  </AlertDescription>
                </Alert>
              )}

              {isVoid && (
                <Alert variant="destructive" className="text-xs">
                  <ShieldAlert className="size-4" />
                  <AlertTitle>Invoice Voided</AlertTitle>
                  <AlertDescription>
                    Reason: {invoice.voidReason || "Voided by admin."}
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
