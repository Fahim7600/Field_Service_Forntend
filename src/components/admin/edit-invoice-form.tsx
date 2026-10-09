"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Info, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import * as React from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { MoneyInput } from "@/components/forms/money-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  centsToInputString,
  MAX_ALLOWED_CENTS,
  parseMoneyToCents,
} from "@/lib/money";
import { financeService } from "@/services/finance.service";
import type { Invoice, InvoiceItemType } from "@/types/api";

const itemSchema = z.object({
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

const editInvoiceSchema = z.object({
  items: z
    .array(itemSchema)
    .min(1, "At least one line item is required")
    .max(30, "Maximum 30 items allowed"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
});

type EditInvoiceFormValues = z.infer<typeof editInvoiceSchema>;

interface EditInvoiceFormProps {
  invoice: Invoice;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditInvoiceForm({
  invoice,
  onCancel,
  onSuccess,
}: EditInvoiceFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize line items from invoice
  const defaultItems =
    invoice.items && invoice.items.length > 0
      ? invoice.items.map((it) => ({
          type: (["LABOR", "PARTS", "EXTRA"].includes(it.type)
            ? it.type
            : "LABOR") as "LABOR" | "PARTS" | "EXTRA",
          description: it.description || "Service item",
          quantity: it.quantity || 1,
          unitAmountStr: centsToInputString(it.unitAmountCents ?? 0),
        }))
      : [
          {
            type: "LABOR" as const,
            description: "Service diagnostic & repair labor",
            quantity: 1,
            unitAmountStr: centsToInputString(invoice.subtotalCents || 0),
          },
        ];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<EditInvoiceFormValues>({
    resolver: zodResolver(editInvoiceSchema),
    defaultValues: {
      items: defaultItems,
      notes: invoice.notes || "",
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = async (values: EditInvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      const payloadItems = values.items.map((it) => ({
        type: it.type as InvoiceItemType,
        description: it.description.trim(),
        quantity: it.quantity,
        unitAmountCents: parseMoneyToCents(it.unitAmountStr) ?? 0,
      }));

      await financeService.updateInvoice(invoice.id, {
        items: payloadItems,
        notes: values.notes?.trim() || undefined,
      });

      toast.success("Invoice updated", {
        description: "Totals were recalculated by the server.",
      });

      await queryClient.invalidateQueries({
        queryKey: ["invoices", invoice.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });

      onSuccess();
    } catch (err: unknown) {
      toast.error("Failed to update invoice charges", {
        description: getErrorMessage(err),
      });
      // Invalidate in case status changed
      queryClient.invalidateQueries({ queryKey: ["invoices", invoice.id] });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold text-foreground">
            Edit Draft Charges
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Adjust line item quantities, descriptions, and unit prices.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-8 px-2 text-xs"
        >
          <X className="size-4" />
          <span className="sr-only">Cancel</span>
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Informational Notice */}
        <Alert className="bg-muted/40 border-border text-foreground text-xs py-2.5">
          <Info className="size-4 text-muted-foreground shrink-0" />
          <AlertDescription className="text-muted-foreground leading-relaxed">
            Totals, premium discount, and taxes are calculated automatically by
            the server when you save.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
          {/* Items Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground">
              Line Items ({fields.length})
            </h4>
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

          {/* Dynamic Item Cards */}
          <div className="space-y-3">
            {fields.map((fieldItem, idx) => (
              <div
                key={fieldItem.id}
                className="p-3.5 bg-muted/20 rounded-xl border border-border/80 space-y-3"
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
                            <SelectItem value="EXTRA">Extra Charge</SelectItem>
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
                      placeholder="Item description"
                      disabled={isSubmitting}
                      className="h-9 text-xs"
                    />
                    {errors.items?.[idx]?.description && (
                      <p className="text-[10px] text-destructive font-medium">
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
                      <p className="text-[10px] text-destructive font-medium">
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
                          aria-label={`Remove line ${idx + 1}`}
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

          {/* Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-notes" className="text-xs font-semibold">
                Internal Notes &amp; Payment Remarks
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Optional (max 500 chars)
              </span>
            </div>
            <Textarea
              id="edit-notes"
              {...register("notes")}
              placeholder="e.g. Adjusted labor fee as agreed during initial inspection."
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
              className="text-xs resize-none"
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !isDirty || !isValid}
              className="gap-2 text-xs font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving &amp; Recalculating...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
