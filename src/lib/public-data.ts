import "server-only";
import { serverFetch } from "@/lib/server-api";
import type { ApiResponse, ServiceCategory } from "@/types/api";
import type { SubscriptionPlan } from "@/types/subscription";

export interface PublicDataResult<T> {
  data: T;
  error: string | null;
}

/**
 * Fetches service categories for public pages.
 *
 * NOTE: As identified in API inspection, GET /service-categories requires a bearer token
 * and is restricted to authenticated users. Calling it unauthenticated returns 401.
 * Therefore, getPublicCategories returns an empty array immediately without calling
 * the API, allowing public marketing pages to use resilient static marketing content.
 */
export async function getPublicCategories(): Promise<
  PublicDataResult<ServiceCategory[]>
> {
  return {
    data: [],
    error: null,
  };
}

/**
 * Fetches active subscription plans for public display.
 * GET /subscription-plans is public and does not require authentication.
 * Uses an 8-second timeout and 300s ISR revalidation. Never throws.
 */
export async function getPublicPlans(): Promise<
  PublicDataResult<SubscriptionPlan[]>
> {
  try {
    const response = await serverFetch<
      ApiResponse<SubscriptionPlan[]> | SubscriptionPlan[]
    >("/subscription-plans", {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });

    let plans: SubscriptionPlan[] = [];
    if (Array.isArray(response)) {
      plans = response;
    } else if (response && Array.isArray(response.data)) {
      plans = response.data;
    }

    return {
      data: plans,
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to load subscription plans";
    return {
      data: [],
      error: message,
    };
  }
}
