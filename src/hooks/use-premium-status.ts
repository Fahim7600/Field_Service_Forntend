"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ApiError } from "@/lib/api-client";
import { subscriptionsService } from "@/services/subscriptions.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Subscription, SubscriptionStatus } from "@/types/subscription";

export interface PremiumStatusResult {
  isPremium: boolean | null;
  subscription: Subscription | null;
  status: SubscriptionStatus | string | null;
  isLoading: boolean;
  isUnknown: boolean;
  isError: boolean;
  refetch: () => void;
}

export function usePremiumStatus(): PremiumStatusResult {
  const user = useAuthStore((state) => state.user);
  const isCustomer = user?.role === "CUSTOMER";

  const { data, isLoading, isError, refetch } = useQuery<Subscription | null>({
    queryKey: ["my-subscription"],
    queryFn: () => subscriptionsService.fetchMySubscription(),
    enabled: isCustomer,
    meta: {
      skipToast: true,
    },
    staleTime: 60_000,
    retry: (failureCount, err) => {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        return false;
      }
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

  if (!isCustomer) {
    return {
      isPremium: false,
      subscription: null,
      status: null,
      isLoading: false,
      isUnknown: false,
      isError: false,
      refetch: () => {},
    };
  }

  let isPremium: boolean | null = null;
  let isUnknown = false;
  let status: SubscriptionStatus | string | null = null;

  if (isLoading) {
    isPremium = null;
    isUnknown = false;
    status = null;
  } else if (isError) {
    // 404 was caught and resolved to null by fetchMySubscription.
    // Any error here is a 5xx / connection error, meaning membership status is unknown.
    isPremium = null;
    isUnknown = true;
    status = null;
  } else if (!data) {
    // No active subscription record found (404 or empty)
    isPremium = false;
    isUnknown = false;
    status = null;
  } else {
    // Subscription exists
    status = data.status;
    isPremium = data.status === "ACTIVE";
    isUnknown = false;
  }

  return {
    isPremium,
    subscription: data ?? null,
    status,
    isLoading,
    isUnknown,
    isError,
    refetch: () => {
      refetch();
    },
  };
}
