"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FeeNotice } from "@/components/customer/fee-notice";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getChangeEstimate } from "@/lib/change-policy";
import { safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { workOrdersService } from "@/services/work-orders.service";
import type { WorkOrder } from "@/types/work-order";

const TIME_SLOT_OPTIONS = [
  { value: "08:00:00", label: "08:00 AM" },
  { value: "08:30:00", label: "08:30 AM" },
  { value: "09:00:00", label: "09:00 AM" },
  { value: "09:30:00", label: "09:30 AM" },
  { value: "10:00:00", label: "10:00 AM" },
  { value: "10:30:00", label: "10:30 AM" },
  { value: "11:00:00", label: "11:00 AM" },
  { value: "11:30:00", label: "11:30 AM" },
  { value: "12:00:00", label: "12:00 PM" },
  { value: "12:30:00", label: "12:30 PM" },
  { value: "13:00:00", label: "01:00 PM" },
  { value: "13:30:00", label: "01:30 PM" },
  { value: "14:00:00", label: "02:00 PM" },
  { value: "14:30:00", label: "02:30 PM" },
  { value: "15:00:00", label: "03:00 PM" },
  { value: "15:30:00", label: "03:30 PM" },
  { value: "16:00:00", label: "04:00 PM" },
  { value: "16:30:00", label: "04:30 PM" },
  { value: "17:00:00", label: "05:00 PM" },
  { value: "17:30:00", label: "05:30 PM" },
  { value: "18:00:00", label: "06:00 PM" },
  { value: "18:30:00", label: "06:30 PM" },
  { value: "19:00:00", label: "07:00 PM" },
  { value: "19:30:00", label: "07:30 PM" },
  { value: "20:00:00", label: "08:00 PM" },
];

const rescheduleSchema = z.object({
  newDate: z.string().min(1, "Please select a new visit date"),
  startTime: z.string().min(1, "Please select a start time"),
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

interface RescheduleJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrder: WorkOrder;
  isPremium: boolean | null;
  requestId?: string;
}

export function RescheduleJobDialog({
  open,
  onOpenChange,
  workOrder,
  isPremium,
  requestId,
}: RescheduleJobDialogProps) {
  const queryClient = useQueryClient();
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  const todayStr = React.useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );

  // Compute existing visit duration (defaulting to 2 hours if not present)
  const durationMs = React.useMemo(() => {
    if (workOrder.visitStart && workOrder.visitEnd) {
      const start = new Date(workOrder.visitStart).getTime();
      const end = new Date(workOrder.visitEnd).getTime();
      const diff = end - start;
      if (diff > 0 && diff <= 12 * 60 * 60 * 1000) {
        return diff;
      }
    }
    return 2 * 60 * 60 * 1000; // 2 hours
  }, [workOrder.visitStart, workOrder.visitEnd]);

  const durationHours = durationMs / (60 * 60 * 1000);

  // Initial date & time prefill (defaults to tomorrow morning or closest slot)
  const defaultDate = React.useMemo(() => {
    if (workOrder.visitStart) {
      const d = safeFormatDate(workOrder.visitStart, "yyyy-MM-dd", "");
      if (d && d >= todayStr) return d;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }, [workOrder.visitStart, todayStr]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      newDate: defaultDate,
      startTime: "09:00:00",
    },
    mode: "onChange",
  });

  const selectedDate = watch("newDate");
  const selectedTime = watch("startTime");

  // Calculate live preview of new visit window
  const newVisitRange = React.useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    try {
      const start = new Date(`${selectedDate}T${selectedTime}`);
      if (Number.isNaN(start.getTime())) return null;
      const end = new Date(start.getTime() + durationMs);
      return {
        start,
        end,
        formatted: `${safeFormatDateTime(start)} – ${safeFormatDate(end, "h:mm a", "")}`,
        isFuture: start.getTime() > Date.now(),
        isDifferent:
          !workOrder.visitStart ||
          Math.abs(start.getTime() - new Date(workOrder.visitStart).getTime()) >
            60_000,
      };
    } catch {
      return null;
    }
  }, [selectedDate, selectedTime, durationMs, workOrder.visitStart]);

  const estimate = React.useMemo(
    () =>
      getChangeEstimate({
        workOrderStatus: workOrder.status,
        visitStart: workOrder.visitStart,
        isPremium,
        action: "reschedule",
      }),
    [workOrder.status, workOrder.visitStart, isPremium],
  );

  const rescheduleMutation = useMutation({
    mutationFn: async (values: RescheduleFormValues) => {
      setConflictError(null);
      const start = new Date(`${values.newDate}T${values.startTime}`);
      const end = new Date(start.getTime() + durationMs);

      if (start.getTime() <= Date.now()) {
        throw new Error("Rescheduled visit time must be in the future.");
      }

      return workOrdersService.rescheduleWorkOrder(workOrder.id, {
        visitStart: start.toISOString(),
        visitEnd: end.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Visit rescheduled", {
        description: "Your new appointment time has been saved.",
      });

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
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; statusCode?: number };
      const msg = err.message || "";
      const isConflict =
        err.statusCode === 409 ||
        msg.toLowerCase().includes("conflict") ||
        msg.toLowerCase().includes("unavailable") ||
        msg.toLowerCase().includes("schedule");

      if (isConflict) {
        setConflictError(
          "That time is not available. Please choose another time.",
        );
      } else {
        setConflictError(msg || "Failed to reschedule work order.");
      }
    },
  });

  const isBusy = rescheduleMutation.isPending || isSubmitting;
  const canSubmit =
    Boolean(newVisitRange?.isFuture) &&
    Boolean(newVisitRange?.isDifferent) &&
    estimate.allowed &&
    !isBusy;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isBusy) {
          setConflictError(null);
          onOpenChange(val);
        }
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!isBusy}>
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
            <RefreshCw className="size-5 text-primary shrink-0" />
            <span>Reschedule Appointment</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Work Order #{workOrder.workOrderNumber || workOrder.id.slice(0, 8)}{" "}
            • Duration: {durationHours} {durationHours === 1 ? "hour" : "hours"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit((vals) => rescheduleMutation.mutate(vals))}
          className="space-y-4 py-1 text-xs"
        >
          {/* Current Visit */}
          {workOrder.visitStart && (
            <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <CalendarIcon className="size-3" />
                Current Appointment
              </span>
              <p className="font-semibold text-foreground">
                {safeFormatDateTime(workOrder.visitStart)}
              </p>
            </div>
          )}

          {/* Conflict / Server Error Alert */}
          {conflictError && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="size-4" />
              <AlertTitle className="text-xs font-bold">
                Scheduling Conflict
              </AlertTitle>
              <AlertDescription className="text-xs">
                {conflictError}
              </AlertDescription>
            </Alert>
          )}

          {/* Date and Time Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="newDate"
                className="text-foreground text-xs font-semibold"
              >
                New Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newDate"
                type="date"
                min={todayStr}
                disabled={isBusy}
                aria-invalid={Boolean(errors.newDate)}
                className="h-9 text-xs"
                {...register("newDate")}
              />
              {errors.newDate && (
                <p className="text-[11px] text-destructive">
                  {errors.newDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="startTime"
                className="text-foreground text-xs font-semibold"
              >
                Start Time <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <select
                  id="startTime"
                  disabled={isBusy}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 outline-none transition-colors"
                  {...register("startTime")}
                >
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
                <Clock className="size-3.5 text-muted-foreground absolute right-3 top-2.5 pointer-events-none" />
              </div>
              {errors.startTime && (
                <p className="text-[11px] text-destructive">
                  {errors.startTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Live Preview */}
          {newVisitRange && (
            <div className="p-3 bg-brand-50/60 dark:bg-brand-950/30 rounded-lg border border-brand-200 dark:border-brand-900/60 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                New Visit Window Preview
              </span>
              <p className="font-bold text-foreground text-xs">
                {newVisitRange.formatted}
              </p>
              {!newVisitRange.isFuture && (
                <p className="text-[11px] text-destructive font-medium">
                  Please select a future date and time.
                </p>
              )}
              {newVisitRange.isFuture && !newVisitRange.isDifferent && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Selected time is identical to the current visit.
                </p>
              )}
            </div>
          )}

          {/* Fee Policy Alert */}
          <FeeNotice estimate={estimate} isPremium={isPremium} />

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className="gap-1.5 text-xs font-semibold"
            >
              {isBusy ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Rescheduling...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  <span>Confirm Reschedule</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
