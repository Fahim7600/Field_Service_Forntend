"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FilePlus,
  Loader2,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { financeService } from "@/services/finance.service";
import { technicianService } from "@/services/technician.service";
import type { InvoiceItemType, WorkOrderSummary } from "@/types/api";

const invoiceItemSchema = z.object({
  type: z.enum(["LABOR", "PARTS", "EXTRA"]),
  description: z.string().trim().min(2, "Description is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitAmountDollars: z.coerce.number().min(0, "Unit price cannot be negative"),
});

const createInvoiceSchema = z.object({
  workOrderId: z.string().uuid("Please select a completed work order"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one line item is required"),
  notes: z.string().trim().max(500).optional(),
});

type CreateInvoiceFormValues = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({
  open,
  onOpenChange,
}: CreateInvoiceDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Fetch completed work orders that can be invoiced
  const { data: workOrdersData, isLoading: isLoadingWOs } = useQuery({
    queryKey: ["work-orders", "completed"],
    queryFn: () =>
      technicianService.fetchWorkOrders({ status: "COMPLETED", limit: 50 }),
    enabled: open,
    staleTime: 15000,
  });

  const completedOrders: WorkOrderSummary[] = workOrdersData?.data || [];

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      workOrderId: "",
      items: [
        {
          type: "LABOR",
          description: "Standard Diagnostic & Labor",
          quantity: 1,
          unitAmountDollars: 85,
        },
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const selectedWorkOrderId = watch("workOrderId");
  const itemsWatch = watch("items") || [];

  // Calculate live total dollars
  const calculatedTotalDollars = React.useMemo(() => {
    return itemsWatch.reduce((acc, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitAmountDollars) || 0;
      return acc + q * p;
    }, 0);
  }, [itemsWatch]);

  React.useEffect(() => {
    if (!open) {
      reset({
        workOrderId: "",
        items: [
          {
            type: "LABOR",
            description: "Standard Diagnostic & Labor",
            quantity: 1,
            unitAmountDollars: 85,
          },
        ],
        notes: "",
      });
    }
  }, [open, reset]);

  const onSubmit = async (values: CreateInvoiceFormValues) => {
    try {
      setIsSubmitting(true);

      const itemsPayload = values.items.map((item) => ({
        type: item.type as InvoiceItemType,
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitAmountCents: Math.round(Number(item.unitAmountDollars) * 100),
      }));

      const res = await financeService.createInvoice({
        workOrderId: values.workOrderId,
        items: itemsPayload,
        notes: values.notes?.trim() || undefined,
      });

      toast.success(
        `Draft Invoice #${res.invoiceNumber} created successfully!`,
      );
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });

      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <FilePlus className="size-5" />
            <DialogTitle>Generate New Invoice</DialogTitle>
          </div>
          <DialogDescription>
            Create an itemized billing draft for a completed work order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
          {/* Work Order Selection */}
          <div className="space-y-1.5">
            <Label
              htmlFor="wo-select"
              className="text-xs font-semibold text-foreground"
            >
              Select Completed Work Order{" "}
              <span className="text-destructive">*</span>
            </Label>
            {isLoadingWOs ? (
              <div className="h-9 rounded-lg border border-border bg-muted/40 animate-pulse" />
            ) : completedOrders.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground text-center">
                No completed work orders available for invoicing.
              </div>
            ) : (
              <Select
                value={selectedWorkOrderId}
                onValueChange={(val: unknown) =>
                  setValue("workOrderId", String(val ?? ""))
                }
              >
                <SelectTrigger id="wo-select" className="h-9 text-xs">
                  <SelectValue placeholder="Choose a completed job..." />
                </SelectTrigger>
                <SelectContent>
                  {completedOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id} className="py-1.5">
                      <span className="font-mono font-medium">
                        #{wo.id.slice(0, 8)}
                      </span>
                      {" — "}
                      <span>{wo.customer?.name || "Customer"}</span>
                      {" • "}
                      <span className="text-muted-foreground text-[11px]">
                        {wo.request?.title || "Service Job"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.workOrderId && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                {errors.workOrderId.message}
              </p>
            )}
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3 border-t border-border/60 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Receipt className="size-3.5 text-primary" />
                  Itemized Line Charges{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Add labor, parts, or extra service charges.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() =>
                  append({
                    type: "PARTS",
                    description: "",
                    quantity: 1,
                    unitAmountDollars: 25,
                  })
                }
                className="gap-1 text-xs"
              >
                <Plus className="size-3" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2.5">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-center rounded-xl border border-border bg-muted/20 p-2.5"
                >
                  <div className="col-span-3">
                    <Select
                      defaultValue={field.type}
                      onValueChange={(val: unknown) =>
                        setValue(
                          `items.${index}.type` as const,
                          val as "LABOR" | "PARTS" | "EXTRA",
                        )
                      }
                    >
                      <SelectTrigger className="h-8 text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LABOR">Labor</SelectItem>
                        <SelectItem value="PARTS">Parts</SelectItem>
                        <SelectItem value="EXTRA">Extra Fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-4">
                    <Input
                      placeholder="Description"
                      {...register(`items.${index}.description` as const)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      {...register(`items.${index}.quantity` as const)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="$ Unit"
                      {...register(`items.${index}.unitAmountDollars` as const)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="col-span-1 text-right">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => remove(index)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete row</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {errors.items && (
              <p className="text-xs text-destructive font-medium">
                {errors.items.message}
              </p>
            )}

            {/* Calculated Subtotal preview */}
            <div className="flex items-center justify-between rounded-lg bg-panel/60 p-2.5 text-xs border border-border/80">
              <span className="font-medium text-muted-foreground">
                Estimated Total Charges:
              </span>
              <span className="font-heading text-sm font-bold text-foreground">
                ${calculatedTotalDollars.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 border-t border-border/60 pt-4">
            <Label
              htmlFor="invoice-notes"
              className="text-xs font-semibold text-foreground"
            >
              Invoice Notes (Optional)
            </Label>
            <Textarea
              id="invoice-notes"
              placeholder="e.g. Work completed in accordance with service agreement..."
              rows={2}
              {...register("notes")}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-border/80">
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
              disabled={isSubmitting || completedOrders.length === 0}
              className="gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Drafting Invoice...</span>
                </>
              ) : (
                <>
                  <FilePlus className="size-4" />
                  <span>Create Draft Invoice</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
