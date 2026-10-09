"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { getErrorMessage } from "@/lib/api-client";
import { adminService } from "@/services/admin.service";

const rejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters long")
    .max(500, "Rejection reason cannot exceed 500 characters"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

interface RejectRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestNumber?: string;
}

export function RejectRequestDialog({
  open,
  onOpenChange,
  requestId,
  requestNumber,
}: RejectRequestDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
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

  const onSubmit = async (values: RejectFormValues) => {
    try {
      setIsSubmitting(true);
      await adminService.reviewRequest(requestId, {
        decision: "REJECT",
        reason: values.reason.trim(),
      });

      toast.success("Request rejected", {
        description: "The customer will be notified.",
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin", "dispatch-queue"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["requests", requestId],
      });

      onOpenChange(false);
      router.push("/admin/dispatch");
    } catch (err) {
      toast.error(getErrorMessage(err));
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
            <DialogTitle>Reject Service Request</DialogTitle>
          </div>
          <DialogDescription>
            Provide a clear and concise reason for rejecting request{" "}
            <span className="font-mono font-medium text-foreground">
              {requestNumber || requestId.slice(0, 8)}
            </span>
            . The customer will be notified with this message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label
                htmlFor="reject-reason"
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
              id="reject-reason"
              placeholder="e.g., We currently do not service this appliance model, or the request lacks necessary access details..."
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
