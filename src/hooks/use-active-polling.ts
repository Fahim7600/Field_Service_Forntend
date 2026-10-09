"use client";

import * as React from "react";
import type { WorkOrderStatus } from "@/types/work-order";

const ACTIVE_WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  "ASSIGNED",
  "SCHEDULED",
  "ARRIVED",
  "IN_PROGRESS",
];

/**
 * Returns a refetchInterval in milliseconds (30,000 ms) while the work order status is active
 * and the document is in the foreground, otherwise returns false to pause polling.
 */
export function useActivePolling(
  status?: WorkOrderStatus | string | null,
): number | false {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (!status || !isVisible) {
    return false;
  }

  const normalizedStatus = String(status).toUpperCase() as WorkOrderStatus;
  if (ACTIVE_WORK_ORDER_STATUSES.includes(normalizedStatus)) {
    return 30000;
  }

  return false;
}
