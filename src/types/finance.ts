/**
 * Invoice status exactly as docs/openapi.json defines it for GET /invoices
 * (customer and admin share the same endpoint and enum). There is no
 * REFUNDED or CANCELLED invoice status: a refund only changes the PAYMENT.
 */
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "VOID";

export type CustomerInvoiceStatus = InvoiceStatus;
export type AdminInvoiceStatus = InvoiceStatus;

export type InvoiceItemType = "LABOR" | "PARTS" | "EXTRA";

export interface InvoiceItem {
  id?: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitAmountCents: number;
  totalCents?: number;
  amountCents?: number;
}

export interface InvoiceCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface InvoiceWorkOrderRef {
  id: string;
  workOrderNumber?: string;
  serviceRequestId?: string;
  status?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotalCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  laborCents?: number;
  partsCents?: number;
  extraCents?: number;
  items?: InvoiceItem[];
  notes?: string | null;
  voidReason?: string | null;
  issuedAt?: string | null;
  dueDate?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  workOrderId?: string;
  workOrder?: InvoiceWorkOrderRef | null;
  customer?: InvoiceCustomer | null;
  customerId?: string;
  currency?: string;
  isPremiumDiscountApplied?: boolean;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  totalCents: number;
  dueDate?: string | null;
  issuedAt?: string | null;
  paidAt?: string | null;
  createdAt?: string;
  customer?: InvoiceCustomer | null;
  workOrder?: InvoiceWorkOrderRef | null;
  workOrderId?: string;
  currency?: string;
}

export interface InvoicesQueryParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus | string;
  sortBy?: "createdAt" | "totalCents" | "status" | string;
  order?: "asc" | "desc";
  workOrderId?: string;
  customerId?: string;
}

export interface CreateInvoiceItemPayload {
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitAmountCents: number;
}

export interface CreateInvoicePayload {
  workOrderId: string;
  items: CreateInvoiceItemPayload[];
  notes?: string;
}

export interface InvoiceUpdatePayload {
  items?: CreateInvoiceItemPayload[];
  notes?: string;
}

export interface VoidInvoicePayload {
  reason: string;
}

export interface VoidInvoiceResponse {
  id: string;
  status: "VOID" | string;
}

/** Payment status enum from the GET /payments `status` query parameter. */
export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

/**
 * Payment as returned by GET /payments (list item) and GET /payments/{id}.
 * The list schema documents id, amountCents, status, stripePaymentIntentId
 * and createdAt. `invoiceId` is only documented on GET /payments/{id}, so it
 * is optional here and the UI only links to the invoice when it is present.
 */
export interface Payment {
  id: string;
  amountCents: number;
  status: PaymentStatus;
  stripePaymentIntentId?: string | null;
  createdAt: string;
  invoiceId?: string;
}

/**
 * Admin list item. The spec returns the same item shape for both roles from
 * the same endpoint (role-based filtering happens on the server) and does NOT
 * include the invoice number or the customer, so no extra fields are typed.
 */
export type AdminPayment = Payment;

export type PaymentSortBy = "createdAt" | "amountCents" | "status";

/** Query params of GET /payments, exactly as documented. */
export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  sortBy?: PaymentSortBy;
  order?: "asc" | "desc";
}

/** @deprecated use PaymentListParams */
export type PaymentsQueryParams = PaymentListParams;

/**
 * Body of POST /admin/payments/{id}/refund. The schema only has `reason`
 * (5 to 300 chars): the refund is always for the full payment amount.
 */
export interface RefundPaymentPayload {
  reason: string;
}

export const REFUND_REASON_MIN = 5;
export const REFUND_REASON_MAX = 300;

export interface RefundPaymentResponse {
  id: string;
  status: "REFUNDED";
}

export interface PaymentSessionStatus {
  paid?: boolean;
  status?: PaymentStatus | string;
  invoiceId?: string;
  invoiceNumber?: string;
  amountCents?: number;
  paymentId?: string;
  message?: string;
}

export interface InitiatePaymentPayload {
  invoiceId: string;
}

/**
 * Raw POST /payments/initiate `data`. The spec documents { checkoutUrl,
 * sessionId }; the real backend returns { paymentId, paymentUrl } when it
 * re-opens a still-open Stripe session, so every variant is optional.
 */
export interface InitiatePaymentResponse {
  paymentId?: string;
  id?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  url?: string;
  sessionId?: string;
}

/** Normalised result of financeService.initiatePayment. */
export interface InitiatePaymentResult {
  paymentId: string | null;
  url: string;
}
