"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, Loader2, XCircle } from "lucide-react";
import * as React from "react";
import { FeeNotice } from "@/components/customer/fee-notice";
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
import { getChangeEstimate } from "@/lib/change-policy";
import { safeFormatDateTime } from "@/lib/format";
import { messages, notify } from "@/lib/notify";
import { workOrdersService } from "@/services/work-orders.service";
import type { WorkOrder } from "@/types/work-order";

interface CancelJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  isPremium: boolean | null;
  requestId?: string;
}

export function CancelJobDialog({
  open,
  onOpenChange,
  workOrder,
  isPremium,
  requestId,
}: CancelJobDialogProps) {
  const [reason, setReason] = React.useState("");
  const queryClient = useQueryClient();

  const estimate = React.useMemo(
    () =>
      getChangeEstimate({
        workOrderStatus: workOrder.status,
        visitStart: workOrder.visitStart,
        isPremium,
        action: "cancel",
      }),
    [workOrder.status, workOrder.visitStart, isPremium],
  );

  const cancelMutation = useMutation({
    mutationFn: () => workOrdersService.cancelWorkOrder(workOrder.id, reason),
    onSuccess: () => {
      const isLateFee = estimate.kind === "LATE_FEE" && estimate.feeCents > 0;
      const description = isLateFee
        ? `A late fee of $${(estimate.feeCents / 100).toFixed(2)} has been added to your invoices.`
        : messages.requests.cancelled.description;

      notify.success(messages.requests.cancelled.title, description, {
        action: isLateFee
          ? {
              label: "View Invoices",
              onClick: () => {
                window.location.href = "/customer/invoices";
              },
            }
          : undefined,
      });

      // Invalidate relevant queries
      if (requestId) {
        queryClient.invalidateQueries({
          queryKey: ["customer-request", requestId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrder.id] });
      queryClient.invalidateQueries({
        queryKey: ["work-order-history", workOrder.id],
      });
      queryClient.invalidateQueries({ queryKey: ["customer-requests"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-history-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["customer", "requests"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-overview-requests"],
      });
      queryClient.invalidateQueries({ queryKey: ["customer-service-history"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });

      onOpenChange(false);
      setReason("");
    },
    onError: (error: unknown) => {
      const err = error as { statusCode?: number };

      // Refetch work order to update view in case status moved to ARRIVED
      queryClient.invalidateQueries({ queryKey: ["work-order", workOrder.id] });
      if (requestId) {
        queryClient.invalidateQueries({
          queryKey: ["customer-request", requestId],
        });
      }

      if (err.statusCode === 400 || err.statusCode === 409) {
        onOpenChange(false);
      }
    },
  });

  const isBusy = cancelMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isBusy) {
          onOpenChange(val);
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isBusy}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-destructive">
            <XCircle className="size-5 text-destructive shrink-0" />
            <span>Cancel Service Job</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Work Order #{workOrder.workOrderNumber || workOrder.id.slice(0, 8)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1 text-xs">
          {/* Confirmed Visit Window */}
          {workOrder.visitStart ? (
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                Scheduled Appointment
              </span>
              <p className="font-semibold text-foreground">
                {safeFormatDateTime(workOrder.visitStart)}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-muted/40 rounded-lg border border-border flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4 shrink-0" />
              <span>Visit time has not been scheduled yet.</span>
            </div>
          )}

          {/* Fee Policy Alert */}
          <FeeNotice estimate={estimate} isPremium={isPremium} />

          {/* Cancellation Reason Input */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="cancel-reason"
                className="text-foreground text-xs font-semibold"
              >
                Reason for Cancellation{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {reason.length}/300
              </span>
            </div>
            <Textarea
              id="cancel-reason"
              placeholder="e.g. Issue resolved independently, need to reschedule later, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 300))}
              disabled={isBusy}
              rows={3}
              className="resize-none text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Keep Job
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isBusy || !estimate.allowed}
            onClick={() => cancelMutation.mutate()}
            className="gap-1.5 text-xs font-semibold"
          >
            {isBusy ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Cancelling Job...</span>
              </>
            ) : (
              <>
                <XCircle className="size-3.5" />
                <span>Confirm Cancellation</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
