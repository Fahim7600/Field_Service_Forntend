"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, getErrorMessage } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { financeService } from "@/services/finance.service";
import {
  type Payment,
  REFUND_REASON_MAX,
  REFUND_REASON_MIN,
} from "@/types/finance";

const refundSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(
      REFUND_REASON_MIN,
      `Refund reason must be at least ${REFUND_REASON_MIN} characters long`,
    )
    .max(
      REFUND_REASON_MAX,
      `Refund reason cannot exceed ${REFUND_REASON_MAX} characters`,
    ),
});

type RefundFormValues = z.infer<typeof refundSchema>;

export interface RefundPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  invoiceNumber?: string;
  customerName?: string;
  onRefundSuccess?: () => void;
}

export function RefundPaymentDialog({
  open,
  onOpenChange,
  payment,
  invoiceNumber,
  customerName,
  onRefundSuccess,
}: RefundPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    formState: { errors },
  } = useForm<RefundFormValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: "",
    },
  });

  const reasonValue = watch("reason") || "";

  React.useEffect(() => {
    if (!open) {
      reset({ reason: "" });
      setIsConfirmOpen(false);
      setErrorMessage(null);
    }
  }, [open, reset]);

  const refundMutation = useMutation({
    meta: { silent: true },
    mutationFn: async (reason: string) => {
      if (!payment) throw new Error("No payment selected");
      return financeService.refundPayment(payment.id, { reason });
    },
    onSuccess: async () => {
      notify.success(
        messages.payments.refunded.title,
        messages.payments.refunded.description,
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payments"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "payments"] }),
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["customer", "invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
      ]);

      if (payment?.invoiceId) {
        await queryClient.invalidateQueries({
          queryKey: ["invoices", payment.invoiceId],
        });
      }

      onRefundSuccess?.();
      setIsConfirmOpen(false);
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err);
      setErrorMessage(msg);
      setIsConfirmOpen(false);

      if (
        err instanceof ApiError &&
        (err.status === 400 || err.status === 409)
      ) {
        queryClient.invalidateQueries({ queryKey: ["payments"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
        if (payment?.invoiceId) {
          queryClient.invalidateQueries({
            queryKey: ["invoices", payment.invoiceId],
          });
        }
      }
    },
  });

  if (!payment) return null;

  const isPending = refundMutation.isPending;

  const handleFormSubmit = () => {
    setErrorMessage(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmRefund = () => {
    const values = getValues();
    refundMutation.mutate(values.reason.trim());
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!isPending) {
            onOpenChange(val);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isPending}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive">
              <RotateCcw className="size-5 shrink-0" />
              <DialogTitle className="text-base sm:text-lg font-bold">
                Refund Payment
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Process a transaction refund via Stripe.
            </DialogDescription>
          </DialogHeader>

          {/* Payment Details Overview */}
          <div className="p-3.5 bg-muted/40 rounded-xl border border-border text-xs space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Payment ID:</span>
              <span className="font-mono font-medium text-foreground">
                {payment.id.slice(0, 12)}...
              </span>
            </div>

            {invoiceNumber && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Invoice:</span>
                <span className="font-mono font-semibold text-foreground">
                  {invoiceNumber}
                </span>
              </div>
            )}

            {customerName && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Customer:</span>
                <span className="font-medium text-foreground">
                  {customerName}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-1.5 border-t border-border/60 text-xs font-bold text-foreground">
              <span>Refund Amount:</span>
              <span className="font-mono text-sm text-destructive">
                {formatMoney(payment.amountCents)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">
            This refunds the full amount of{" "}
            <span className="font-semibold font-mono text-foreground">
              {formatMoney(payment.amountCents)}
            </span>
            .
          </p>

          <Alert className="bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 py-2.5 text-xs">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <AlertDescription className="text-[11px] leading-relaxed">
              This returns the money to the customer through Stripe and cannot
              be undone.
            </AlertDescription>
          </Alert>

          {errorMessage && (
            <Alert className="border-destructive/40 bg-destructive/5 text-destructive py-2.5 text-xs">
              <AlertCircle className="size-4 text-destructive shrink-0" />
              <AlertTitle className="text-xs font-semibold">
                Refund Failed
              </AlertTitle>
              <AlertDescription className="text-[11px] text-destructive/90">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4 pt-1"
          >
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="refund-reason"
                  className="font-semibold text-foreground"
                >
                  Reason for Refund <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-[10px] ${
                    reasonValue.length > REFUND_REASON_MAX
                      ? "text-destructive font-semibold"
                      : reasonValue.length < REFUND_REASON_MIN
                        ? "text-muted-foreground"
                        : "text-emerald-600 dark:text-emerald-400 font-medium"
                  }`}
                >
                  {reasonValue.length}/{REFUND_REASON_MAX} chars (min{" "}
                  {REFUND_REASON_MIN})
                </span>
              </div>

              <Textarea
                id="refund-reason"
                placeholder="e.g., Customer satisfaction refund or billing adjustment for duplicate service."
                rows={3}
                disabled={isPending}
                {...register("reason")}
                className={`text-xs resize-none ${
                  errors.reason
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }`}
              />

              {errors.reason && (
                <p className="text-[11px] text-destructive flex items-center gap-1 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {errors.reason.message}
                </p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={
                  isPending || reasonValue.trim().length < REFUND_REASON_MIN
                }
                className="gap-2 text-xs font-semibold"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Refund {formatMoney(payment.amountCents)}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Step Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={(val) => {
          if (!isPending) setIsConfirmOpen(val);
        }}
        title="Are you sure you want to issue this refund?"
        description={`A refund of ${formatMoney(payment.amountCents)} will be initiated immediately through Stripe to the original payment method.`}
        confirmLabel="Confirm & Issue Refund"
        variant="destructive"
        pending={isPending}
        onConfirm={handleConfirmRefund}
      />
    </>
  );
}
