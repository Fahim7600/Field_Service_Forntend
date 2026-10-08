"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  Wrench,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { technicianService } from "@/services/technician.service";

const reportSchema = z.object({
  workDone: z
    .string()
    .trim()
    .min(10, "Work done description must be at least 10 characters")
    .max(2000, "Work done description cannot exceed 2000 characters"),
  hoursSpent: z.coerce
    .number({ invalid_type_error: "Hours spent is required" })
    .min(0.25, "Hours spent must be at least 0.25 hours (15 mins)")
    .max(24, "Hours spent cannot exceed 24 hours"),
  partsUsed: z.array(
    z.object({
      name: z.string().trim().min(1, "Part name is required"),
      quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    }),
  ),
});

type ReportFormValues = z.infer<typeof reportSchema>;

interface ServiceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  requestNumber?: string;
}

export function ServiceReportDialog({
  open,
  onOpenChange,
  workOrderId,
  requestNumber,
}: ServiceReportDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      workDone: "",
      hoursSpent: 1.0,
      partsUsed: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "partsUsed",
  });

  const workDoneValue = watch("workDone") || "";

  React.useEffect(() => {
    if (!open) {
      reset();
      setSelectedFiles([]);
    }
  }, [open, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      if (selectedFiles.length + filesArr.length > 5) {
        toast.error("You can attach at most 5 photos per report.");
        return;
      }
      setSelectedFiles((prev) => [...prev, ...filesArr].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ReportFormValues) => {
    try {
      setIsSubmitting(true);

      // 1. Submit the Service Report
      await technicianService.submitServiceReport(workOrderId, {
        workDone: values.workDone.trim(),
        hoursSpent: Number(values.hoursSpent),
        partsUsed: values.partsUsed.length > 0 ? values.partsUsed : undefined,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
      });

      // 2. Complete the Work Order status
      await technicianService.updateTaskStatus(workOrderId, {
        status: "COMPLETED",
      });

      toast.success("Job completed and service report filed successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["technician", "tasks"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["work-orders", workOrderId],
      });

      onOpenChange(false);
      router.push("/technician/tasks?tab=history");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <FileCheck2 className="size-5" />
            <DialogTitle>Complete Work Order & File Report</DialogTitle>
          </div>
          <DialogDescription>
            Document the completed service for work order #
            {workOrderId.slice(0, 8)}
            {requestNumber ? ` (${requestNumber})` : ""}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Work Done */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <Label
                htmlFor="work-done"
                className="font-semibold text-foreground"
              >
                Work Done Summary <span className="text-destructive">*</span>
              </Label>
              <span
                className={`text-[11px] ${
                  workDoneValue.length > 2000
                    ? "text-destructive font-semibold"
                    : workDoneValue.length < 10
                      ? "text-muted-foreground"
                      : "text-emerald-600 dark:text-emerald-400 font-medium"
                }`}
              >
                {workDoneValue.length}/2000 chars (min 10)
              </span>
            </div>
            <Textarea
              id="work-done"
              placeholder="Describe repairs executed, testing performed, diagnostic steps, or findings..."
              rows={4}
              disabled={isSubmitting}
              {...register("workDone")}
              className={
                errors.workDone
                  ? "border-destructive focus-visible:ring-destructive/20"
                  : ""
              }
            />
            {errors.workDone && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                {errors.workDone.message}
              </p>
            )}
          </div>

          {/* Hours Spent */}
          <div className="space-y-2">
            <Label
              htmlFor="hours-spent"
              className="text-xs font-semibold text-foreground flex items-center gap-1.5"
            >
              <Clock className="size-3.5 text-primary" />
              Hours Spent <span className="text-destructive">*</span>
            </Label>
            <Input
              id="hours-spent"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              disabled={isSubmitting}
              {...register("hoursSpent")}
              className={`h-9 text-xs max-w-xs ${
                errors.hoursSpent
                  ? "border-destructive focus-visible:ring-destructive/20"
                  : ""
              }`}
            />
            {errors.hoursSpent && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                {errors.hoursSpent.message}
              </p>
            )}
          </div>

          {/* Parts Used (Optional) */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Wrench className="size-3.5 text-primary" />
                  Parts Replaced / Materials Used (Optional)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Record any spare parts or consumables used during repair.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => append({ name: "", quantity: 1 })}
                className="gap-1 text-xs"
              >
                <Plus className="size-3" />
                Add Part
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="Part name or description"
                      {...register(`partsUsed.${index}.name` as const)}
                      disabled={isSubmitting}
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      {...register(`partsUsed.${index}.quantity` as const)}
                      disabled={isSubmitting}
                      className="h-8 text-xs w-20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => remove(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Remove part</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Attachments (File upload) */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                Service Completion Photos (Optional, max 5)
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Attach before/after photos of the equipment or repaired area.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full cursor-pointer rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center hover:bg-muted/40 transition-colors block"
            >
              <UploadCloud className="size-6 text-muted-foreground mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">
                Click to upload completion photos
              </p>
              <p className="text-[11px] text-muted-foreground">
                PNG, JPG, WebP up to 10MB each ({selectedFiles.length}/5
                selected)
              </p>
            </button>

            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${idx}`}
                    className="relative flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-foreground shadow-2xs"
                  >
                    <span className="line-clamp-1 max-w-[150px] font-mono text-[11px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">Remove file</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-border/80">
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
              size="sm"
              disabled={isSubmitting}
              className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Filing Report & Completing Job...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Submit Report & Finish Job</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
