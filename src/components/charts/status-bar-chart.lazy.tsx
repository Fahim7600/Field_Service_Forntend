"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "./chart-card";
import type { StatusBarChartProps } from "./status-bar-chart";

/**
 * Lazy-loaded StatusBarChart with ssr: false to prevent hydration mismatches
 * and ensure Recharts only runs in the client environment.
 */
export const StatusBarChartLazy = dynamic<StatusBarChartProps>(
  () =>
    import("./status-bar-chart").then((mod) => ({
      default: mod.StatusBarChart,
    })),
  {
    ssr: false,
    loading: () => <ChartSkeleton height={280} />,
  },
);
