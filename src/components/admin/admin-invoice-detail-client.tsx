"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit,
  ExternalLink,
  Loader2,
  Send,
  ShieldAlert,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { EditInvoiceForm } from "@/components/admin/edit-invoice-form";
import { InvoiceBreakdown } from "@/components/shared/invoice-breakdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import type { Invoice } from "@/types/api";

interface AdminInvoiceDetailClientProps {
  id: string;
}

export function AdminInvoiceDetailClient({
  id,
}: AdminInvoiceDetailClientProps) {
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = React.useState(false);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = React.useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = React.useState(false);
  const [voidReason, setVoidReason] = React.useState("");

  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: () => financeService.fetchInvoiceById(id),
    staleTime: 10000,
  });

  // Issue Invoice Mutation
  const issueMutation = useMutation({
    mutationFn: async () => financeService.issueInvoice(id),
    onSuccess: async () => {
      toast.success("Invoice issued", {
        description: "The customer has been notified.",
      });
      setIsIssueDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: unknown) => {
      toast.error("Failed to issue invoice", {
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    },
  });

  // Void Invoice Mutation
  const voidMutation = useMutation({
    mutationFn: async (reason: string) =>
      financeService.voidInvoice(id, reason),
    onSuccess: async () => {
      toast.success("Invoice voided", {
        description: "The invoice status has been updated to VOID.",
      });
      setIsVoidDialogOpen(false);
      setVoidReason("");
      await queryClient.invalidateQueries({ queryKey: ["invoices", id] });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (err: unknown) => {
      toast.error("Failed to void invoice", {
        description: getErrorMessage(err),
      });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
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
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <Card className="border-destructive/30 bg-destructive/5 p-6 space-y-4">
          <CardContent className="space-y-3 p-0">
            <AlertCircle className="size-8 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-destructive">
                Invoice Not Found
              </h3>
              <p className="text-xs text-muted-foreground">
                {error
                  ? getErrorMessage(error)
                  : "The requested billing invoice could not be located."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Link
                href="/admin/invoices"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs font-semibold",
                )}
              >
                <ArrowLeft className="size-3.5" />
                <span>All Invoices</span>
              </Link>
              <Button
                size="sm"
                onClick={() => refetch()}
                className="gap-1.5 text-xs font-semibold"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = String(invoice.status).toUpperCase();
  const isDraft = status === "DRAFT";
  const isIssued = status === "ISSUED";
  const isPaid = status === "PAID";
  const isVoid = status === "VOID";
  const isCancelled = status === "CANCELLED";
  const isRefunded = status === "REFUNDED";

  const isPendingAction = issueMutation.isPending || voidMutation.isPending;

  const workOrderId =
    invoice.workOrderId ||
    invoice.workOrder?.id ||
    invoice.workOrder?.serviceRequestId;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Invoices</span>
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
              {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}
            </h1>
            <StatusBadge status={invoice.status} />
          </div>
        </div>

        {/* Action Buttons for DRAFT */}
        {isDraft && !isEditing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              disabled={isPendingAction}
              className="gap-1.5 text-xs font-medium"
            >
              <Edit className="size-3.5" />
              <span>Edit Charges</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsIssueDialogOpen(true)}
              disabled={isPendingAction}
              className="gap-1.5 text-xs font-semibold shadow-xs"
            >
              <Send className="size-3.5" />
              <span>Issue Invoice</span>
            </Button>
          </div>
        )}
      </div>

      {/* Prominent Void Notice */}
      {isVoid && (
        <Alert className="border-destructive/40 bg-destructive/5 text-destructive py-3">
          <XCircle className="size-4 text-destructive shrink-0" />
          <div className="space-y-1">
            <AlertTitle className="font-semibold text-xs">
              Invoice Voided
            </AlertTitle>
            <AlertDescription className="text-xs text-destructive/90">
              {invoice.voidReason
                ? `Reason: ${invoice.voidReason}`
                : "This invoice was voided by an administrator and is no longer payable."}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Inline Editing Form for Draft */}
      {isEditing && isDraft ? (
        <EditInvoiceForm
          invoice={invoice}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details (Left 2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            <InvoiceBreakdown invoice={invoice} />

            {/* Internal Notes / Customer Note */}
            {invoice.notes && (
              <Card className="border-border shadow-xs">
                <CardHeader className="pb-2 border-b border-border">
                  <CardTitle className="text-xs font-bold text-foreground">
                    Invoice Notes &amp; Instructions
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

          {/* Sidebar Info & Action Controls (Right Col) */}
          <div className="space-y-6">
            {/* Status & Lifecycle Actions Card */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground">
                  Invoice Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {isDraft && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This draft invoice is not yet visible to the customer.
                      Review the calculated amounts, edit if needed, and issue
                      the invoice.
                    </p>
                    <div className="space-y-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setIsIssueDialogOpen(true)}
                        disabled={isPendingAction}
                        className="w-full gap-2 text-xs font-semibold shadow-xs"
                      >
                        <Send className="size-3.5" />
                        <span>Issue Invoice</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        disabled={isPendingAction}
                        className="w-full gap-2 text-xs font-medium"
                      >
                        <Edit className="size-3.5" />
                        <span>Edit Line Items</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsVoidDialogOpen(true)}
                        disabled={isPendingAction}
                        className="w-full gap-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="size-3.5" />
                        <span>Void Invoice</span>
                      </Button>
                    </div>
                  </div>
                )}

                {isIssued && (
                  <div className="space-y-3">
                    <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200 text-xs py-2.5">
                      <Clock className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <AlertDescription>
                        Issued to customer for payment. The customer can pay via
                        online Stripe checkout.
                      </AlertDescription>
                    </Alert>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsVoidDialogOpen(true)}
                        disabled={isPendingAction}
                        className="w-full gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <XCircle className="size-3.5" />
                        <span>Void Invoice</span>
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center mt-2">
                        Voiding an unpaid invoice cannot be undone.
                      </p>
                    </div>
                  </div>
                )}

                {isPaid && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                      <CheckCircle2 className="size-4" />
                      <span>Payment Completed</span>
                    </div>
                    <p className="text-xs text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                      This invoice was paid in full on{" "}
                      {invoice.paidAt
                        ? safeFormatDateTime(invoice.paidAt)
                        : "record"}
                      .
                    </p>
                    {/* Note: Refund actions are implemented in the customer/stripe refunds prompt */}
                  </div>
                )}

                {(isVoid || isCancelled || isRefunded) && (
                  <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-1 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block">
                      Read-Only Record
                    </span>
                    <p>
                      This invoice is closed in status {status} and cannot be
                      modified.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer & Job Metadata Card */}
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-xs font-bold text-foreground">
                  Associated Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                {/* Customer */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Customer
                  </span>
                  <div className="flex items-start gap-2">
                    <User className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {invoice.customer?.name || "Customer"}
                      </p>
                      {invoice.customer?.email && (
                        <p className="text-[11px] text-muted-foreground">
                          {invoice.customer.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Associated Work Order */}
                {workOrderId && (
                  <div className="space-y-1 pt-2 border-t border-border/60">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Work Order
                    </span>
                    <Link
                      href={`/admin/work-orders/${workOrderId}`}
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

                {/* Dates Information */}
                <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Created Date:</span>
                    <span className="font-medium text-foreground">
                      {safeFormatDate(invoice.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Issued Date:</span>
                    <span className="font-medium text-foreground">
                      {invoice.issuedAt
                        ? safeFormatDate(invoice.issuedAt)
                        : "—"}
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
      )}

      {/* AlertDialog: Issue Invoice Confirmation */}
      <AlertDialog
        open={isIssueDialogOpen}
        onOpenChange={(val) => {
          if (!issueMutation.isPending) setIsIssueDialogOpen(val);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Issue this invoice to the customer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The invoice status will change to ISSUED and the customer will be
              notified by email. They will be able to view and pay the invoice
              online.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={issueMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                issueMutation.mutate();
              }}
              disabled={issueMutation.isPending}
              className="gap-2 font-semibold"
            >
              {issueMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Issuing...</span>
                </>
              ) : (
                <span>Confirm &amp; Issue</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Void Invoice Reason */}
      <Dialog
        open={isVoidDialogOpen}
        onOpenChange={(val) => {
          if (!voidMutation.isPending) {
            setIsVoidDialogOpen(val);
            if (!val) setVoidReason("");
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={!voidMutation.isPending}
        >
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-destructive">
              <ShieldAlert className="size-5 text-destructive shrink-0" />
              <span>Void Invoice</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please provide an audit reason for voiding this invoice (min 5,
              max 300 characters).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="void-reason" className="text-xs font-semibold">
                  Reason for Voiding <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {voidReason.trim().length} / 300
                </span>
              </div>
              <Textarea
                id="void-reason"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Job canceled prior to technician arrival; billing adjustment required."
                rows={3}
                maxLength={300}
                disabled={voidMutation.isPending}
                className="text-xs resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVoidDialogOpen(false)}
              disabled={voidMutation.isPending}
              className="text-xs"
            >
              Keep Invoice
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => voidMutation.mutate(voidReason.trim())}
              disabled={
                voidMutation.isPending ||
                voidReason.trim().length < 5 ||
                voidReason.trim().length > 300
              }
              className="gap-2 text-xs font-semibold"
            >
              {voidMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Voiding...</span>
                </>
              ) : (
                <span>Confirm Void</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
