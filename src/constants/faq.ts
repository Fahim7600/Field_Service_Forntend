import { formatMoney } from "@/lib/format";
import {
  LATE_FEE_CENTS,
  LATE_FEE_WINDOW_HOURS,
  MAX_PHOTO_MB,
  MAX_REQUEST_PHOTOS,
  PREMIUM_LABOR_DISCOUNT_PERCENT,
  REVIEW_TARGET_HOURS_NORMAL,
  REVIEW_TARGET_HOURS_PREMIUM,
} from "./policy";

export type FaqCategory =
  | "booking"
  | "payments"
  | "premium"
  | "technicians"
  | "account";

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

const formattedLateFee = formatMoney(LATE_FEE_CENTS);

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "how-to-book",
    category: "booking",
    question: "How do I book a service?",
    answer: `Create an account or log in, choose a service discipline, describe your problem in detail, optionally attach up to ${MAX_REQUEST_PHOTOS} diagnostic photos, and select your preferred service date and arrival window.`,
  },
  {
    id: "account-requirement",
    category: "account",
    question: "Do I need an account to book a service?",
    answer:
      "Yes. You must create an account to submit requests, monitor live dispatch status, review technician service reports, and pay itemized invoices.",
  },
  {
    id: "review-turnaround",
    category: "booking",
    question: "How are requests reviewed and how long does it take?",
    answer: `Our dispatch operations team reviews every incoming request to confirm the problem scope and required skill set. We target a review turnaround of within ${REVIEW_TARGET_HOURS_PREMIUM} hours for Premium members and within ${REVIEW_TARGET_HOURS_NORMAL} hours for standard requests.`,
  },
  {
    id: "cancel-or-reschedule",
    category: "booking",
    question: "Can I cancel or reschedule a scheduled visit?",
    answer: `Premium subscribers can cancel or reschedule free of charge at any time until the technician arrives on site. Standard customers can cancel or reschedule freely if more than ${LATE_FEE_WINDOW_HOURS} hours remain before the scheduled visit; cancellations or reschedules inside ${LATE_FEE_WINDOW_HOURS} hours incur a late fee of ${formattedLateFee} added as an invoice.`,
  },
  {
    id: "how-to-pay",
    category: "payments",
    question: "How do I pay for completed work?",
    answer:
      "After the technician completes the visit and submits their service report, an itemized invoice is issued. You pay securely online using Stripe Checkout. Card information is processed directly by Stripe and is never stored on our servers.",
  },
  {
    id: "payment-failure",
    category: "payments",
    question: "What happens if a payment fails?",
    answer:
      "If a payment attempt is declined or fails, the invoice status remains unpaid in your customer portal. You can retry with the same payment method or choose a different card through Stripe Checkout.",
  },
  {
    id: "premium-benefits",
    category: "premium",
    question: "What benefits does Premium membership include?",
    answer: `Premium membership provides target ${REVIEW_TARGET_HOURS_PREMIUM}-hour priority request reviews, an automatic ${PREMIUM_LABOR_DISCOUNT_PERCENT}% discount on invoice labor charges, and free cancellations and rescheduling until the technician arrives on site.`,
  },
  {
    id: "cancel-premium",
    category: "premium",
    question: "How do I cancel my Premium membership?",
    answer:
      "You can cancel your subscription renewal at any time directly from the Premium Membership section in your customer portal. All benefits remain active until the end of your currently paid billing period.",
  },
  {
    id: "photo-formats",
    category: "booking",
    question: "Which photo formats and file sizes are accepted?",
    answer: `You can upload JPG, PNG, or WebP image files. You may attach up to ${MAX_REQUEST_PHOTOS} photos per request, with a maximum size of ${MAX_PHOTO_MB} MB per image.`,
  },
  {
    id: "rate-the-job",
    category: "booking",
    question: "Can I rate the technician and leave feedback?",
    answer:
      "Yes. Once an invoice is paid, you can submit a 1 to 5 star rating and written review for the technician who performed the work. Each job can be reviewed once.",
  },
  {
    id: "become-technician",
    category: "technicians",
    question: "How do I become a technician on the platform?",
    answer:
      "Technician accounts are approved and provisioned by our operations administration team. Register for an initial account, contact dispatch, and the admin team can update your account role to technician after verifying qualifications.",
  },
  {
    id: "update-profile",
    category: "account",
    question: "How do I change my password or profile details?",
    answer:
      "Log in to your account and navigate to your Profile page. You can update your contact information, phone number, address, and password securely.",
  },
];
