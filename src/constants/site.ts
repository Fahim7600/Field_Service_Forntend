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

export const siteConfig = {
  name: "Field Service",
  shortDescription:
    "On-demand Field Service Management platform for scheduling, dispatching, and customer operations.",
  description:
    "Comprehensive enterprise field service management platform for dispatching, scheduling, technician work orders, and customer communication.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiBase: process.env.NEXT_PUBLIC_API_BASE || "/api/v1",
  links: {
    github: "https://github.com/Fahim7600/Field_Service_Forntend.git",
    backendGithub: "https://github.com/Fahim7600/Field_Service.git",
  },
};

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
