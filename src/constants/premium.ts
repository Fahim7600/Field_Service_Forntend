import type { LucideIcon } from "lucide-react";
import { Clock, Percent, ShieldCheck } from "lucide-react";

export interface PremiumBenefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PREMIUM_BENEFITS: PremiumBenefit[] = [
  {
    id: "priority_queue",
    title: "Priority Review & Dispatch",
    description:
      "Premium requests get HIGH priority and are reviewed within 2 hours instead of 24.",
    icon: Clock,
  },
  {
    id: "labor_discount",
    title: "Labor Charge Discount",
    description: "10% off the labor charge on every invoice.",
    icon: Percent,
  },
  {
    id: "free_changes",
    title: "Flexible Changes & Cancellation",
    description:
      "Free cancel and reschedule until the technician arrives, no late fee.",
    icon: ShieldCheck,
  },
];

export interface ComparisonFeature {
  name: string;
  description: string;
  free: string | boolean;
  premium: string | boolean;
}

export const PLAN_COMPARISON_FEATURES: ComparisonFeature[] = [
  {
    name: "Request Review Time",
    description: "Average turnaround to approve and dispatch",
    free: "Within 24 hours",
    premium: "Within 2 hours (High Priority)",
  },
  {
    name: "Invoice Labor Discount",
    description: "Discount applied automatically to labor fees",
    free: false,
    premium: "10% off labor charge",
  },
  {
    name: "Cancellation & Rescheduling",
    description: "Late fee exemptions before technician arrival",
    free: "Standard late fee applies",
    premium: "Free cancellation & reschedule",
  },
];

export const PREMIUM_WIZARD_PRIORITY_NOTE = {
  active: "Premium: your request is reviewed first (target within 2 hours).",
  inactive: "Premium members get priority review.",
};
