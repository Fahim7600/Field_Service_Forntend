import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/types/api";

export interface InvoiceBreakdownProps {
  invoice: Invoice;
  className?: string;
  title?: string;
  description?: string;
}

export function InvoiceBreakdown({
  invoice,
  className,
  title = "Line Items Breakdown",
  description = "Detailed labor, parts, and extra charges recorded for this job.",
}: InvoiceBreakdownProps) {
  const subtotalCents = invoice.subtotalCents ?? 0;
  const discountCents = invoice.discountCents ?? 0;
  const taxCents = invoice.taxCents ?? 0;
  const totalCents = invoice.totalCents ?? 0;

  const laborCents =
    invoice.laborCents ??
    (invoice.items || [])
      .filter((it) => it.type === "LABOR")
      .reduce(
        (sum, it) => sum + (it.totalCents || it.quantity * it.unitAmountCents),
        0,
      );

  const partsCents =
    invoice.partsCents ??
    (invoice.items || [])
      .filter((it) => it.type === "PARTS")
      .reduce(
        (sum, it) => sum + (it.totalCents || it.quantity * it.unitAmountCents),
        0,
      );

  const extraCents =
    invoice.extraCents ??
    (invoice.items || [])
      .filter((it) => it.type === "EXTRA")
      .reduce(
        (sum, it) => sum + (it.totalCents || it.quantity * it.unitAmountCents),
        0,
      );

  return (
    <Card className={cn("border-border shadow-xs overflow-hidden", className)}>
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold text-foreground font-heading">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {invoice.items && invoice.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2.5 px-4">Item &amp; Description</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.items.map((item, idx) => {
                  const itemTotal =
                    item.totalCents !== undefined
                      ? item.totalCents
                      : item.amountCents !== undefined
                        ? item.amountCents
                        : item.quantity * item.unitAmountCents;

                  return (
                    <tr
                      key={item.id || `line-${idx}`}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {item.description || "Service Charge"}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant="secondary"
                          className="text-[10px] uppercase font-semibold px-2 py-0.5"
                        >
                          {item.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-muted-foreground">
                        {formatMoney(item.unitAmountCents)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                        {formatMoney(itemTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No detailed line items listed. Aggregate charges are summarized
            below.
          </div>
        )}
      </CardContent>

      {/* Totals Summary Block */}
      <div className="p-5 sm:p-6 bg-muted/20 border-t border-border space-y-2.5 text-xs">
        {laborCents > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Labor Charges</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(laborCents)}
            </span>
          </div>
        )}

        {partsCents > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Parts &amp; Materials</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(partsCents)}
            </span>
          </div>
        )}

        {extraCents > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Extra / Disposal Charges</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(extraCents)}
            </span>
          </div>
        )}

        {subtotalCents > 0 && (
          <div className="flex justify-between items-center pt-1 border-t border-border/60 text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(subtotalCents)}
            </span>
          </div>
        )}

        {/* Premium Member Discount */}
        {discountCents > 0 && (
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Premium Member Discount</span>
            </span>
            <span className="font-mono font-semibold">
              -{formatMoney(discountCents)}
            </span>
          </div>
        )}

        {/* Tax */}
        {taxCents > 0 && (
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Estimated Tax</span>
            <span className="font-mono font-medium text-foreground">
              {formatMoney(taxCents)}
            </span>
          </div>
        )}

        {/* Final Total */}
        <div className="flex justify-between items-center pt-3 border-t border-border text-sm font-bold text-foreground">
          <span>Total Amount</span>
          <span className="text-base sm:text-lg font-mono text-primary font-bold">
            {formatMoney(totalCents)}
          </span>
        </div>
      </div>
    </Card>
  );
}
