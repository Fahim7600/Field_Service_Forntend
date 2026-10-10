import {
  CalendarClock,
  ClipboardList,
  CreditCard,
  type LucideIcon,
  SearchCheck,
  Wrench,
} from "lucide-react";
import type { MarketingImageKey } from "./images";

export interface ServiceArea {
  slug: string;
  title: string;
  description: string;
  imageKey: MarketingImageKey;
}

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "ac-repair",
    title: "Air Conditioning Repair",
    description:
      "Book certified cooling specialists for diagnostics, refrigerant recharges, airflow troubleshooting, and seasonal HVAC system maintenance.",
    imageKey: "acRepair",
  },
  {
    slug: "plumbing",
    title: "Plumbing Services",
    description:
      "Resolve pipe leaks, slow drainage, water heater malfunctions, and fixture installations with licensed, experienced plumbers.",
    imageKey: "plumbing",
  },
  {
    slug: "electrical-work",
    title: "Electrical Work",
    description:
      "Schedule electrical inspections, circuit breaker diagnostics, wiring repairs, and safe fixture installations by qualified electricians.",
    imageKey: "electrical",
  },
  {
    slug: "appliance-repair",
    title: "Appliance Repair",
    description:
      "Get rapid diagnosis and component repair for washers, dryers, refrigerators, ovens, and essential major household appliances.",
    imageKey: "appliance",
  },
];

export interface HowItWorksStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    step: 1,
    title: "Request",
    subtitle: "Describe the problem",
    description:
      "Describe the issue, attach photos of the equipment, and select your preferred service date and arrival window.",
    icon: ClipboardList,
  },
  {
    step: 2,
    title: "Review",
    subtitle: "Dispatch review",
    description:
      "Our operations team verifies request details, scope of work, and dispatch priority.",
    icon: SearchCheck,
  },
  {
    step: 3,
    title: "Assign & Schedule",
    subtitle: "Technician matching",
    description:
      "A qualified technician with the required skills is assigned and your visit is scheduled with guaranteed notification.",
    icon: CalendarClock,
  },
  {
    step: 4,
    title: "Work & Report",
    subtitle: "On-site service",
    description:
      "The technician arrives on site, completes diagnostics and repair, and files a comprehensive digital service report.",
    icon: Wrench,
  },
  {
    step: 5,
    title: "Pay & Rate",
    subtitle: "Transparent closing",
    description:
      "Review the finalized invoice, pay securely online with Stripe, and rate your technician's workmanship.",
    icon: CreditCard,
  },
];

export interface AudiencePoint {
  title: string;
  badge: string;
  description: string;
  features: string[];
}

export const AUDIENCE_POINTS: AudiencePoint[] = [
  {
    title: "For Property Owners & Customers",
    badge: "Customers",
    description:
      "On-demand field service booking with full visibility from submission to completion.",
    features: [
      "Book any service in minutes with photo attachments",
      "Real-time status updates on technician dispatch and arrival",
      "Itemized digital invoices with secure Stripe online checkout",
      "Verified technician reviews and service history tracking",
    ],
  },
  {
    title: "For Field Technicians",
    badge: "Technicians",
    description:
      "A purpose-built field workflow to manage assigned jobs and file structured service reports.",
    features: [
      "Clear daily task schedules and equipment details",
      "Customer location, notes, and uploaded diagnostic photos",
      "Direct work order status updates from the field",
      "Digital service report submission and parts logging",
    ],
  },
  {
    title: "For Admins & Dispatch Team",
    badge: "Operations",
    description:
      "Centralized oversight of all customer requests, technician allocation, and billing.",
    features: [
      "Review incoming requests and filter by urgency",
      "Match technicians by verified skill sets and availability",
      "Monitor scheduled jobs and work order lifecycles",
      "Generate invoices and audit payment statuses",
    ],
  },
];
