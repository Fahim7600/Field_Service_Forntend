"use client";

import { BarChart3 } from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/shared/empty-state";

export interface StatusBarChartItem {
  label: string;
  value: number;
  color?: string;
}

export interface StatusBarChartProps {
  data: StatusBarChartItem[];
  height?: number;
  valueFormatter?: (value: number) => string;
  ariaLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

// Color palette aligned with StatusBadge and theme (charcoal, brand amber, muted blues/emeralds/grays, no neon)
const DEFAULT_STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#d97706", // amber-600
  APPROVED: "#2563eb", // blue-600
  ASSIGNED: "#4f46e5", // indigo-600
  SCHEDULED: "#7c3aed", // purple-600
  ARRIVED: "#0891b2", // cyan-600
  IN_PROGRESS: "#ea580c", // orange-600
  COMPLETED: "#059669", // emerald-600
  REJECTED: "#dc2626", // red-600
  CANCELLED: "#4b5563", // charcoal/gray-600
  DRAFT: "#6b7280", // gray-500
  PAID: "#059669", // emerald-600
  ACTIVE: "#059669", // emerald-600
  SUSPENDED: "#dc2626", // red-600
};

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return prefersReducedMotion;
}

function formatLabel(label: string): string {
  return label
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function StatusBarChart({
  data,
  height = 280,
  valueFormatter = (v) => v.toLocaleString(),
  ariaLabel,
  emptyTitle = "No data to show yet",
  emptyDescription = "Status distributions will populate as operations are recorded.",
}: StatusBarChartProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const totalValue = data.reduce((acc, item) => acc + (item.value || 0), 0);
  const isEmpty = data.length === 0 || totalValue === 0;

  if (isEmpty) {
    return (
      <div
        style={{ minHeight: height }}
        className="flex items-center justify-center"
      >
        <EmptyState
          icon={BarChart3}
          title={emptyTitle}
          description={emptyDescription}
          className="border-0 shadow-none py-6"
        />
      </div>
    );
  }

  const chartSummary =
    ariaLabel ||
    `Bar chart showing distribution across ${data.length} categories with a total count of ${totalValue}.`;

  return (
    <section className="w-full space-y-3" aria-label={chartSummary}>
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 12, right: 10, left: -22, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-border/60"
            />
            <XAxis
              dataKey="label"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) => {
                const formatted = formatLabel(val);
                return formatted.length > 10
                  ? `${formatted.slice(0, 9)}…`
                  : formatted;
              }}
              className="text-muted-foreground"
            />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              className="text-muted-foreground"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as StatusBarChartItem;
                  const formattedName = formatLabel(item.label);
                  return (
                    <div className="rounded-lg border border-border bg-card p-2.5 shadow-md text-xs space-y-1">
                      <p className="font-semibold text-foreground">
                        {formattedName}
                      </p>
                      <p className="text-primary font-medium">
                        Count: {valueFormatter(item.value)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              radius={[5, 5, 0, 0]}
              isAnimationActive={!prefersReducedMotion}
            >
              {data.map((entry) => {
                const color =
                  entry.color ||
                  DEFAULT_STATUS_COLORS[entry.label.toUpperCase()] ||
                  "#4f46e5";
                return <Cell key={entry.label} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible "View data" Table */}
      <details className="text-xs text-muted-foreground group">
        <summary className="cursor-pointer font-medium hover:text-foreground select-none transition-colors inline-flex items-center gap-1.5 py-1">
          <span>View data table</span>
          <span className="text-[10px] text-muted-foreground/80 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <div className="mt-2 overflow-x-auto rounded border border-border/70">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-muted/40 border-b border-border/70 text-muted-foreground">
              <tr>
                <th className="py-1.5 px-3 font-semibold">Status / Category</th>
                <th className="py-1.5 px-3 font-semibold text-right">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((row) => (
                <tr key={row.label} className="hover:bg-muted/20">
                  <td className="py-1.5 px-3 text-foreground font-medium">
                    {formatLabel(row.label)}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-muted-foreground">
                    {valueFormatter(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
