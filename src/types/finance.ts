export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PAID"
  | "VOID"
  | "REFUNDED"
  | "CANCELLED";

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

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export interface Payment {
  id: string;
  amountCents: number;
  status: PaymentStatus;
  invoiceId?: string;
  stripePaymentIntentId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentsQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus | string;
  sortBy?: "createdAt" | "amountCents" | "status" | string;
  order?: "asc" | "desc";
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

export interface InitiatePaymentResponse {
  paymentId?: string;
  checkoutUrl?: string;
  url?: string;
  sessionId?: string;
}
