import { apiGet, apiGetPaginated, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateInvoicePayload,
  InitiatePaymentPayload,
  InitiatePaymentResponse,
  Invoice,
  InvoiceListItem,
  InvoicesQueryParams,
  InvoiceUpdatePayload,
  MySubscriptionResponse,
  PaginatedResponse,
  Payment,
  PaymentsQueryParams,
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
   * Accepts an invoice ID string or an InitiatePaymentPayload object.
   */
  async initiatePayment(
    input: string | InitiatePaymentPayload,
  ): Promise<InitiatePaymentResponse> {
    const payload: InitiatePaymentPayload =
      typeof input === "string" ? { invoiceId: input } : input;

    const res = await apiPost<InitiatePaymentResponse, InitiatePaymentPayload>(
      "/payments/initiate",
      payload,
    );

    // Normalize URL field across potential response variations
    const checkoutUrl = res.checkoutUrl || res.url;
    return {
      paymentId: res.paymentId,
      checkoutUrl,
      url: checkoutUrl,
      sessionId: res.sessionId,
    };
  },

  /**
   * Retrieves paginated payment transactions.
   */
  async fetchPayments(
    params?: PaymentsQueryParams,
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
