import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id?: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

export interface ResponsiveDataListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  columns: ColumnDef<T>[];
  mobileCardRender?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ResponsiveDataList<T>({
  items,
  keyExtractor,
  columns,
  mobileCardRender,
  emptyState,
  className,
}: ResponsiveDataListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Mobile Stacked Cards View (hidden on md and larger) */}
      <div className="block md:hidden space-y-3">
        {items.map((item) => {
          const key = keyExtractor(item);

          if (mobileCardRender) {
            return <div key={key}>{mobileCardRender(item)}</div>;
          }

          return (
            <Card
              key={key}
              className="border border-border bg-card p-4 shadow-2xs space-y-3"
            >
              <CardContent className="p-0 space-y-2 text-sm">
                {columns
                  .filter((col) => !col.mobileHidden)
                  .map((col) => {
                    const colKey = col.id || col.header;
                    return (
                      <div
                        key={`${key}-${colKey}`}
                        className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 last:border-b-0 last:pb-0"
                      >
                        <span className="text-xs font-semibold text-charcoal-500">
                          {col.header}
                        </span>
                        <div className="text-xs font-medium text-charcoal-900 text-right">
                          {col.cell(item)}
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View (hidden on mobile, visible on md and larger) */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border bg-panel text-charcoal-600">
              {columns.map((col) => {
                const colKey = col.id || col.header;
                return (
                  <th
                    key={colKey}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-xs font-semibold uppercase tracking-wider",
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const key = keyExtractor(item);
              return (
                <tr key={key} className="hover:bg-muted/50 transition-colors">
                  {columns.map((col) => {
                    const colKey = col.id || col.header;
                    return (
                      <td
                        key={`${key}-${colKey}`}
                        className={cn(
                          "px-4 py-3.5 text-xs text-charcoal-800 align-middle",
                          col.className,
                        )}
                      >
                        {col.cell(item)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
