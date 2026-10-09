import { apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  InitiatePaymentResult,
  Invoice,
  InvoiceListItem,
  InvoicesQueryParams,
  InvoiceUpdatePayload,
  MySubscriptionResponse,
  PaginatedResponse,
  Payment,
  PaymentListParams,
  RefundPaymentPayload,
  RefundPaymentResponse,
  SubscriptionCheckoutPayload,
  SubscriptionCheckoutResponse,
  SubscriptionPlan,
  VoidInvoiceResponse,
} from "@/types/api";

export const financeService = {
  /**
   * Retrieves paginated invoices (filtered by status, sort, etc.).
   */
  async fetchInvoices(
    params?: InvoicesQueryParams,
  ): Promise<PaginatedResponse<InvoiceListItem>> {
    return apiGetPaginated<InvoiceListItem>("/invoices", {
      params,
    });
  },

  /**
   * Retrieves single invoice details by ID with line items, breakdown, and dates.
   */
  async fetchInvoiceById(id: string): Promise<Invoice> {
    return apiGet<Invoice>(`/invoices/${id}`);
  },

  /**
   * Creates a new manual draft invoice for a completed work order (Admin only).
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
   * Updates line items or notes on a draft invoice (Admin only).
   */
  async updateInvoice(
    id: string,
    payload: InvoiceUpdatePayload,
  ): Promise<{ id: string }> {
    return apiPatch<{ id: string }, InvoiceUpdatePayload>(
      `/admin/invoices/${id}`,
      payload,
    );
  },

  /**
   * Issues/sends a drafted invoice to the customer notification/email (Admin only).
   */
  async issueInvoice(id: string): Promise<{ success: boolean }> {
    return apiPost<{ success: boolean }>(`/admin/invoices/${id}/send`);
  },

  /**
   * Legacy alias for issueInvoice.
   */
  async sendInvoice(id: string): Promise<{ success: boolean }> {
    return this.issueInvoice(id);
  },

  /**
   * Voids an unpaid/draft invoice with a required reason (Admin only).
   */
  async voidInvoice(id: string, reason: string): Promise<VoidInvoiceResponse> {
    return apiPost<VoidInvoiceResponse, { reason: string }>(
      `/admin/invoices/${id}/void`,
      { reason },
    );
  },

  /**
   * Initiates a Stripe checkout payment session for an issued invoice.
   * The spec documents { checkoutUrl, sessionId } but the backend returns
   * { paymentId, paymentUrl } when it re-opens a still-open session, so all
   * known field names are accepted. The caller must still validate the url
   * with isSafeCheckoutUrl before redirecting.
   */
  async initiatePayment(
    input: string | InitiatePaymentPayload,
  ): Promise<InitiatePaymentResult> {
    const payload: InitiatePaymentPayload =
      typeof input === "string" ? { invoiceId: input } : input;

    const data = await apiPost<InitiatePaymentResponse, InitiatePaymentPayload>(
      "/payments/initiate",
      payload,
    );

    const url = data.paymentUrl ?? data.checkoutUrl ?? data.url;
    if (!url) {
      throw new Error("Invalid payment response");
    }

    return {
      paymentId: data.paymentId ?? data.id ?? null,
      url,
    };
  },

  /**
   * Paginated payments. The same endpoint serves both roles: customers get
   * their own payments, admins get all payments (server-side filtering).
   */
  async fetchPayments(
    params?: PaymentListParams,
  ): Promise<PaginatedResponse<Payment>> {
    return apiGetPaginated<Payment>("/payments", {
      params,
    });
  },

  /**
   * Retrieves specific payment details by ID.
   */
  async fetchPaymentById(id: string): Promise<Payment> {
    return apiGet<Payment>(`/payments/${id}`);
  },

  /**
   * Issues a full refund through Stripe (Admin only). The spec body only
   * accepts a reason; there is no partial amount field.
   */
  async refundPayment(
    id: string,
    payload: RefundPaymentPayload,
  ): Promise<RefundPaymentResponse> {
    return apiPost<RefundPaymentResponse, RefundPaymentPayload>(
      `/admin/payments/${id}/refund`,
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
