import { publicEnv } from "@/lib/env";

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  disabled?: boolean;
}

export interface FooterSection {
  title: string;
  items: NavItem[];
}

export interface ContactEntry {
  type: "email" | "phone" | "address" | "hours";
  label: string;
  value: string;
  href?: string;
}

function parseEnvString(val: string | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const rawContactEmail = parseEnvString(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const rawContactPhone = parseEnvString(process.env.NEXT_PUBLIC_CONTACT_PHONE);
const rawContactAddress = parseEnvString(
  process.env.NEXT_PUBLIC_CONTACT_ADDRESS,
);
const rawContactHours = parseEnvString(process.env.NEXT_PUBLIC_CONTACT_HOURS);

export const siteConfig = {
  name: "Field Service",
  tagline: "Reliable On-Demand Field Service & Certified Repairs",
  shortDescription:
    "On-demand Field Service Management platform for scheduling, dispatching, and customer operations.",
  description:
    "Comprehensive enterprise field service management platform for dispatching, scheduling, technician work orders, and customer communication.",
  url: publicEnv.appUrl,
  apiBase: publicEnv.apiBase,
  keywords: [
    "field service management",
    "AC repair",
    "plumbing",
    "electrical repair",
    "appliance repair",
    "book a technician",
  ],
  links: {
    github: "https://github.com/Fahim7600/Field_Service_Forntend.git",
    backendGithub: "https://github.com/Fahim7600/Field_Service.git",
  },
  contact: {
    email: rawContactEmail,
    phone: rawContactPhone,
    address: rawContactAddress,
    hours: rawContactHours,
  },
};

/**
 * Returns only the contact entries that have a configured value.
 * Omits any missing or empty environment variables to avoid placeholder data.
 */
export function getContactEntries(): ContactEntry[] {
  const entries: ContactEntry[] = [];

  if (siteConfig.contact.email) {
    entries.push({
      type: "email",
      label: "Email",
      value: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
    });
  }

  if (siteConfig.contact.phone) {
    // Strip non-digits for tel link
    const cleanTel = siteConfig.contact.phone.replace(/[^\d+]/g, "");
    entries.push({
      type: "phone",
      label: "Phone",
      value: siteConfig.contact.phone,
      href: `tel:${cleanTel}`,
    });
  }

  if (siteConfig.contact.address) {
    entries.push({
      type: "address",
      label: "Address",
      value: siteConfig.contact.address,
    });
  }

  if (siteConfig.contact.hours) {
    entries.push({
      type: "hours",
      label: "Hours",
      value: siteConfig.contact.hours,
    });
  }

  return entries;
}

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "Pricing", href: "/pricing" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const footerLinks: FooterSection[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    items: [
      { title: "Services", href: "/services" },
      { title: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Login", href: "/login" },
      { title: "Register", href: "/register" },
    ],
  },
];
