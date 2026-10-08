import { apiGet, apiGetPaginated, apiPost } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  InvoiceDetail,
  InvoiceSummary,
  InvoicesQueryParams,
  MySubscriptionResponse,
  PaginatedResponse,
  SubscriptionCheckoutPayload,
  SubscriptionCheckoutResponse,
  SubscriptionPlan,
} from "@/types/api";

export const financeService = {
  /**
   * Retrieves paginated invoices (filtered by user role on backend).
   */
  async fetchInvoices(
    params?: InvoicesQueryParams,
  ): Promise<PaginatedResponse<InvoiceSummary>> {
    return apiGetPaginated<InvoiceSummary>("/invoices", {
      params,
    });
  },

  /**
   * Retrieves single invoice details by ID with line items and payment history.
   */
  async fetchInvoiceById(id: string): Promise<InvoiceDetail> {
    return apiGet<InvoiceDetail>(`/invoices/${id}`);
  },

  /**
   * Creates a new draft invoice for a completed work order (Admin only).
   */
  async createInvoice(
    payload: CreateInvoicePayload,
  ): Promise<{ id: string; invoiceNumber: string }> {
    return apiPost<{ id: string; invoiceNumber: string }, CreateInvoicePayload>(
      "/admin/invoices",
      payload,
    );
  },

  /**
   * Issues/sends a drafted invoice to the customer (Admin only).
   */
  async sendInvoice(id: string): Promise<unknown> {
    return apiPost<unknown>(`/admin/invoices/${id}/send`);
  },

  /**
   * Voids an invoice with a required reason (Admin only).
   */
  async voidInvoice(id: string, reason: string): Promise<unknown> {
    return apiPost<unknown, { reason: string }>(`/admin/invoices/${id}/void`, {
      reason,
    });
  },

  /**
   * Initiates a Stripe checkout payment session for an issued invoice.
   */
  async initiatePayment(
    payload: InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> {
    return apiPost<InitiatePaymentResponse, InitiatePaymentPayload>(
      "/payments/initiate",
      payload,
    );
  },

  /**
   * Retrieves available public subscription membership plans.
   */
  async fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return apiGet<SubscriptionPlan[]>("/subscription-plans");
  },

  /**
   * Creates a Stripe checkout session for a subscription plan upgrade.
   */
  async createSubscriptionCheckout(
    payload: SubscriptionCheckoutPayload,
  ): Promise<SubscriptionCheckoutResponse> {
    return apiPost<SubscriptionCheckoutResponse, SubscriptionCheckoutPayload>(
      "/subscriptions/checkout",
      payload,
    );
  },

  /**
   * Retrieves current customer's active subscription status.
   */
  async fetchMySubscription(): Promise<MySubscriptionResponse | null> {
    try {
      return await apiGet<MySubscriptionResponse>("/subscriptions/me");
    } catch {
      return null;
    }
  },
};
