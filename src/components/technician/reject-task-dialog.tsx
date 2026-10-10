"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { messages, notify } from "@/lib/notify";
import { technicianService } from "@/services/technician.service";

const rejectTaskSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters long")
    .max(500, "Rejection reason cannot exceed 500 characters"),
});

type RejectTaskFormValues = z.infer<typeof rejectTaskSchema>;

interface RejectTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  requestNumber?: string;
}

export function RejectTaskDialog({
  open,
  onOpenChange,
  workOrderId,
  requestNumber,
}: RejectTaskDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RejectTaskFormValues>({
    resolver: zodResolver(rejectTaskSchema),
    defaultValues: {
      reason: "",
    },
  });

  const reasonValue = watch("reason") || "";

  React.useEffect(() => {
    if (!open) {
      reset({ reason: "" });
    }
  }, [open, reset]);

  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(newOpen);
  };

  const onSubmit = async (values: RejectTaskFormValues) => {
    try {
      setIsSubmitting(true);
      await technicianService.rejectTask(workOrderId, values.reason.trim());

      notify.success(
        messages.tasks.rejected.title,
        messages.tasks.rejected.description,
      );

      await queryClient.invalidateQueries({
        queryKey: ["technician", "tasks"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["technician", "task", workOrderId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "work-orders", workOrderId],
      });

      onOpenChange(false);
      router.push("/technician/tasks");
    } catch (err) {
      notify.fromError(err, "Failed to reject job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-5" />
            <DialogTitle>Reject Job Assignment</DialogTitle>
          </div>
          <DialogDescription>
            Decline work order assignment #{workOrderId.slice(0, 8)}
            {requestNumber ? ` (${requestNumber})` : ""}. This task will be
            returned to the dispatch queue for re-assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label
                htmlFor="reject-task-reason"
                className="font-semibold text-charcoal-800 dark:text-charcoal-200"
              >
                Reason for Rejection <span className="text-destructive">*</span>
              </Label>
              <span
                className={`text-[11px] ${
                  reasonValue.length > 500
                    ? "text-destructive font-semibold"
                    : reasonValue.length < 10
                      ? "text-muted-foreground"
                      : "text-emerald-600 dark:text-emerald-400 font-medium"
                }`}
              >
                {reasonValue.length}/500 chars (min 10)
              </span>
            </div>

            <Textarea
              id="reject-task-reason"
              placeholder="e.g., Equipment malfunction, unexpected emergency, or schedule overlap..."
              rows={4}
              disabled={isSubmitting}
              {...register("reason")}
              className={
                errors.reason
                  ? "border-destructive focus-visible:ring-destructive/20"
                  : ""
              }
            />

            {errors.reason && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={isSubmitting}
              className="gap-2 shadow-xs"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>Confirm Rejection</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
