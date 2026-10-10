export type PlanInterval = "MONTH" | "YEAR";

export type SubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "INACTIVE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: PlanInterval | string;
  priceCents: number;
  currency?: string;
  features?: string[];
  active?: boolean;
}

export interface Subscription {
  id: string;
  userId?: string;
  status: SubscriptionStatus | string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
  planId?: string;
  plan?: {
    id?: string;
    name: string;
    interval: string;
    priceCents?: number;
  } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutResult {
  url: string;
  sessionId?: string;
}
