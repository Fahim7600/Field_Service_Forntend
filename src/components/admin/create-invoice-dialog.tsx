"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ExternalLink,
  Info,
  Loader2,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { MoneyInput } from "@/components/forms/money-input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/api-client";
import { safeFormatDate } from "@/lib/format";
import { MAX_ALLOWED_CENTS, parseMoneyToCents } from "@/lib/money";
import { messages, notify } from "@/lib/notify";
import { financeService } from "@/services/finance.service";
import { workOrdersService } from "@/services/work-orders.service";
import type { InvoiceItemType, WorkOrder } from "@/types/api";

const invoiceItemFormSchema = z.object({
  type: z.enum(["LABOR", "PARTS", "EXTRA"]),
  description: z
    .string()
    .trim()
    .min(2, "Description must be at least 2 characters")
    .max(200, "Description cannot exceed 200 characters"),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(1000, "Quantity cannot exceed 1000"),
  unitAmountStr: z.string().refine((val) => {
    const cents = parseMoneyToCents(val);
    return cents !== null && cents >= 0 && cents <= MAX_ALLOWED_CENTS;
  }, "Enter a valid amount (e.g. 50.00)"),
});

const createInvoiceSchema = z.object({
  workOrderId: z.string().min(1, "Please select a completed work order"),
  items: z
    .array(invoiceItemFormSchema)
    .min(1, "At least one line item is required")
    .max(30, "Maximum 30 line items allowed"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [conflictError, setConflictError] = React.useState<{
    message: string;
    existingInvoiceId?: string;
  } | null>(null);

  // Fetch completed work orders
  const { data: workOrdersData, isLoading: isLoadingWOs } = useQuery({
    queryKey: ["work-orders", { status: "COMPLETED", limit: 50 }],
    queryFn: () =>
      workOrdersService.fetchWorkOrders({ status: "COMPLETED", limit: 50 }),
    enabled: open,
    staleTime: 15000,
  });

  const completedOrders: WorkOrder[] = workOrdersData?.data || [];

  const {
    register,
    control,
    handleSubmit,
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
          description: "Service Labor & Diagnostics",
          quantity: 1,
          unitAmountStr: "85.00",
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

  React.useEffect(() => {
    if (open) {
      setConflictError(null);
    } else {
      reset({
        workOrderId: "",
        items: [
          {
            type: "LABOR",
            description: "Service Labor & Diagnostics",
            quantity: 1,
            unitAmountStr: "85.00",
          },
        ],
        notes: "",
      });
      setConflictError(null);
    }
  }, [open, reset]);

  const onSubmit = async (values: CreateInvoiceFormValues) => {
    setIsSubmitting(true);
    setConflictError(null);

    try {
      const payloadItems = values.items.map((it) => {
        const cents = parseMoneyToCents(it.unitAmountStr) ?? 0;
        return {
          type: it.type as InvoiceItemType,
          description: it.description.trim(),
          quantity: it.quantity,
          unitAmountCents: cents,
        };
      });

      const res = await financeService.createInvoice({
        workOrderId: values.workOrderId,
        items: payloadItems,
        notes: values.notes?.trim() || undefined,
      });

      notify.success(
        messages.invoices.created.title,
        messages.invoices.created.description,
      );

      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["work-orders"] });

      onOpenChange(false);
      if (res?.id) {
        router.push(`/admin/invoices/${res.id}`);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      const isConflict =
        msg.toLowerCase().includes("already exists") ||
        msg.toLowerCase().includes("conflict") ||
        (typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          (err as { statusCode: number }).statusCode === 409);

      if (isConflict) {
        // Look up if we know the invoiceId for this work order
        const matchedWO = completedOrders.find(
          (wo) => wo.id === values.workOrderId,
        );
        setConflictError({
          message:
            msg ||
            "An invoice already exists for this work order. Review the existing invoice instead.",
          existingInvoiceId: matchedWO?.invoiceId || undefined,
        });
      } else {
        notify.fromError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isSubmitting) {
          onOpenChange(val);
        }
      }}
    >
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-foreground">
            <Receipt className="size-5 text-primary shrink-0" />
            <span>Create Manual Invoice</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manually create a draft invoice for a completed service job.
          </DialogDescription>
        </DialogHeader>

        {/* Info Banner */}
        <Alert className="bg-muted/50 border-border text-foreground text-xs py-2.5">
          <Info className="size-4 text-muted-foreground shrink-0" />
          <AlertDescription className="text-muted-foreground leading-relaxed">
            The system usually creates a draft automatically when the technician
            submits the report. Use this fallback only if no draft exists.
          </AlertDescription>
        </Alert>

        {/* Conflict Error Alert */}
        {conflictError && (
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive text-xs py-3">
            <AlertCircle className="size-4 shrink-0 text-destructive" />
            <div className="space-y-2">
              <AlertTitle className="font-semibold">
                Invoice Already Exists
              </AlertTitle>
              <AlertDescription className="text-destructive/90">
                {conflictError.message}
              </AlertDescription>
              <div className="pt-1">
                {conflictError.existingInvoiceId ? (
                  <Link
                    href={`/admin/invoices/${conflictError.existingInvoiceId}`}
                    onClick={() => onOpenChange(false)}
                    className="inline-flex items-center gap-1.5 font-semibold text-xs underline hover:no-underline"
                  >
                    <span>View Existing Invoice</span>
                    <ExternalLink className="size-3" />
                  </Link>
                ) : (
                  <Link
                    href="/admin/invoices"
                    onClick={() => onOpenChange(false)}
                    className="inline-flex items-center gap-1.5 font-semibold text-xs underline hover:no-underline"
                  >
                    <span>Go to Invoice List</span>
                    <ExternalLink className="size-3" />
                  </Link>
                )}
              </div>
            </div>
          </Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 py-1 text-xs"
        >
          {/* Work Order Picker */}
          <div className="space-y-1.5">
            <Label htmlFor="wo-select" className="text-xs font-semibold">
              Completed Work Order <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="workOrderId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    setConflictError(null);
                  }}
                  disabled={isSubmitting || isLoadingWOs}
                >
                  <SelectTrigger id="wo-select" className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        isLoadingWOs
                          ? "Loading completed work orders..."
                          : completedOrders.length === 0
                            ? "No completed work orders available"
                            : "Select a completed job..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {completedOrders.map((wo) => {
                      const hasInvoice = Boolean(wo.invoiceId);
                      const woLabel = `WO #${wo.workOrderNumber || wo.id.slice(0, 8)}`;
                      const custName =
                        wo.technician?.name || "Completed Service";
                      const dateStr = wo.updatedAt
                        ? safeFormatDate(wo.updatedAt)
                        : "";

                      return (
                        <SelectItem
                          key={wo.id}
                          value={wo.id}
                          disabled={hasInvoice}
                          className="text-xs py-2"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 w-full">
                            <span className="font-semibold">
                              {woLabel} • {custName}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {hasInvoice ? "(Invoice exists)" : dateStr}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.workOrderId && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.workOrderId.message}
              </p>
            )}
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  Invoice Line Items <span className="text-destructive">*</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Add labor, parts, or extra charges. Server computes totals,
                  discounts, and taxes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    type: "PARTS",
                    description: "",
                    quantity: 1,
                    unitAmountStr: "0.00",
                  })
                }
                disabled={isSubmitting || fields.length >= 30}
                className="gap-1.5 text-xs h-7"
              >
                <Plus className="size-3.5" />
                <span>Add Item</span>
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((fieldItem, idx) => (
                <div
                  key={fieldItem.id}
                  className="p-3 bg-muted/30 rounded-xl border border-border/80 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Item Type */}
                    <div className="sm:col-span-3 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Type
                      </Label>
                      <Controller
                        name={`items.${idx}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LABOR">Labor</SelectItem>
                              <SelectItem value="PARTS">Parts</SelectItem>
                              <SelectItem value="EXTRA">
                                Extra Charge
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-5 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Description
                      </Label>
                      <Input
                        {...register(`items.${idx}.description`)}
                        placeholder="Item or service description"
                        disabled={isSubmitting}
                        className="h-9 text-xs"
                      />
                      {errors.items?.[idx]?.description && (
                        <p className="text-[10px] text-destructive">
                          {errors.items[idx]?.description?.message}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2 space-y-1">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Qty
                      </Label>
                      <Input
                        {...register(`items.${idx}.quantity`, {
                          valueAsNumber: true,
                        })}
                        type="number"
                        min={1}
                        max={1000}
                        disabled={isSubmitting}
                        className="h-9 text-xs"
                      />
                      {errors.items?.[idx]?.quantity && (
                        <p className="text-[10px] text-destructive">
                          {errors.items[idx]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    {/* Unit Amount */}
                    <div className="sm:col-span-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[11px] font-medium text-muted-foreground">
                          Unit Price
                        </Label>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(idx)}
                            disabled={isSubmitting}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`Remove item ${idx + 1}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                      <Controller
                        name={`items.${idx}.unitAmountStr`}
                        control={control}
                        render={({ field }) => (
                          <MoneyInput
                            {...field}
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className="h-9 text-xs"
                            error={errors.items?.[idx]?.unitAmountStr?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.items?.root && (
              <p className="text-xs text-destructive">
                {errors.items.root.message}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="invoice-notes" className="text-xs font-semibold">
                Internal Notes &amp; Payment Instructions
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Optional (max 500 chars)
              </span>
            </div>
            <Textarea
              id="invoice-notes"
              {...register("notes")}
              placeholder="e.g. Diagnostic inspection charges approved by customer on-site."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="text-xs resize-none"
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !selectedWorkOrderId}
              className="gap-2 text-xs font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating Draft...</span>
                </>
              ) : (
                <span>Create Draft Invoice</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
