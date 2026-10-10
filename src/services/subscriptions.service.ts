import axios from "axios";
import { ApiError, apiGet, apiPost } from "@/lib/api-client";
import type {
  CheckoutResult,
  Subscription,
  SubscriptionPlan,
} from "@/types/subscription";

interface RawCheckoutResponse {
  url?: string;
  checkoutUrl?: string;
  paymentUrl?: string;
  sessionUrl?: string;
  sessionId?: string;
}

export const subscriptionsService = {
  /**
   * Retrieves all active subscription plans (public endpoint).
   */
  async fetchPlans(): Promise<SubscriptionPlan[]> {
    return apiGet<SubscriptionPlan[]>("/subscription-plans");
  },

  /**
   * Retrieves the current customer's active subscription.
   * Returns null when the server responds with 404 (no active subscription record).
   */
  async fetchMySubscription(): Promise<Subscription | null> {
    try {
      return await apiGet<Subscription>("/subscriptions/me");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        return null;
      }
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Initiates a Stripe checkout session for the specified plan ID.
   * Tolerantly normalises checkoutUrl / url / paymentUrl / sessionUrl.
   */
  async startCheckout(planId: string): Promise<CheckoutResult> {
    const data = await apiPost<RawCheckoutResponse, { planId: string }>(
      "/subscriptions/checkout",
      { planId },
    );

    const url =
      data?.url ?? data?.checkoutUrl ?? data?.paymentUrl ?? data?.sessionUrl;

    if (!url || typeof url !== "string") {
      throw new Error("Invalid checkout response");
    }

    return {
      url,
      sessionId: data.sessionId,
    };
  },

  /**
   * Cancels automatic renewal for the customer's current subscription.
   * Benefits remain active until currentPeriodEnd.
   */
  async cancelRenewal(): Promise<unknown> {
    return apiPost<unknown>("/subscriptions/cancel");
  },
};
