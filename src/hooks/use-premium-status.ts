"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { apiGet } from "@/lib/api-client";
import type { MySubscriptionResponse } from "@/types/api";

export interface PremiumStatusResult {
  isPremium: boolean | null;
  subscription: MySubscriptionResponse | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function usePremiumStatus(): PremiumStatusResult {
  const { data, isLoading, isError, refetch } =
    useQuery<MySubscriptionResponse | null>({
      queryKey: ["my-subscription", "status"],
      queryFn: async () => {
        try {
          const response =
            await apiGet<MySubscriptionResponse>("/subscriptions/me");
          return response;
        } catch (err: unknown) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            return null;
          }
          throw err;
        }
      },
      meta: {
        skipToast: true,
      },
      staleTime: 60_000,
      retry: (failureCount, err) => {
        if (
          axios.isAxiosError(err) &&
          err.response?.status &&
          err.response.status >= 400 &&
          err.response.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    });

  let isPremium: boolean | null = null;

  if (isLoading) {
    isPremium = null;
  } else if (isError) {
    // 404 is caught and returns null data, other errors mean unknown
    isPremium = null;
  } else if (!data) {
    // No active subscription record found (404 or empty)
    isPremium = false;
  } else {
    // Subscription exists: only ACTIVE status counts as premium
    const status = String(data.status || "").toUpperCase();
    isPremium = status === "ACTIVE";
  }

  return {
    isPremium,
    subscription: data ?? null,
    isLoading,
    isError,
    refetch,
  };
}
