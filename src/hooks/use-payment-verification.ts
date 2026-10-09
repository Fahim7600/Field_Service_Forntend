"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import type { PaymentSessionStatus } from "@/types/api";

export type PaymentVerificationState =
  | "confirming"
  | "paid"
  | "failed"
  | "delayed"
  | "unknown";

interface UsePaymentVerificationOptions {
  sessionId: string | null;
  maxPollingSeconds?: number;
}

export function usePaymentVerification({
  sessionId,
  maxPollingSeconds = 45,
}: UsePaymentVerificationOptions) {
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [isHardTimedOut, setIsHardTimedOut] = React.useState(false);

  // Timer tracking elapsed polling seconds
  React.useEffect(() => {
    if (!sessionId) return;

    setElapsedSeconds(0);
    setIsHardTimedOut(false);

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (next >= maxPollingSeconds) {
          setIsHardTimedOut(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, maxPollingSeconds]);

  const { data, error, isLoading, isError, refetch } = useQuery<{
    success: boolean;
    data?: PaymentSessionStatus;
    message?: string;
  }>({
    queryKey: ["payment-verification", sessionId],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error("Missing session ID");
      }

      // Use standard fetch without axios interceptors to prevent auth redirects
      const res = await fetch(
        `/api/payment-status?session_id=${encodeURIComponent(sessionId)}`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.message ||
            `Payment verification failed with status ${res.status}`,
        );
      }

      return res.json();
    },
    enabled: Boolean(sessionId),
    // Poll every 2 seconds while payment is still pending and within timeout
    refetchInterval: (query) => {
      if (isHardTimedOut) return false;

      const resData = query.state.data?.data;
      const status = String(resData?.status || "").toUpperCase();
      const isPaid = Boolean(resData?.paid || status === "SUCCEEDED");
      const isTerminal = [
        "SUCCEEDED",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ].includes(status);

      if (isPaid || isTerminal) {
        return false;
      }

      return 2000;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
  });

  const paymentData = data?.data;
  const rawStatus = String(paymentData?.status || "").toUpperCase();
  const isPaid = Boolean(paymentData?.paid || rawStatus === "SUCCEEDED");
  const isFailed = rawStatus === "FAILED" || rawStatus === "CANCELLED";

  let state: PaymentVerificationState = "unknown";
  if (!sessionId) {
    state = "unknown";
  } else if (isPaid) {
    state = "paid";
  } else if (isFailed) {
    state = "failed";
  } else if (isHardTimedOut && !isPaid) {
    state = "delayed";
  } else if (isLoading || rawStatus === "PENDING" || rawStatus === "") {
    state = "confirming";
  } else if (isError) {
    state = "unknown";
  }

  return {
    state,
    data: paymentData,
    error,
    isPaid,
    isHardTimedOut,
    elapsedSeconds,
    refetch,
  };
}
