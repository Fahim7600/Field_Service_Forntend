import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Crown,
  FileText,
  History,
  Layers,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Sparkles,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface DashboardLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  links: DashboardLink[];
}

export const CUSTOMER_LINKS: DashboardLink[] = [
  {
    label: "Dashboard",
    href: "/customer",
    icon: LayoutDashboard,
  },
  {
    label: "My Requests",
    href: "/customer/requests",
    icon: ClipboardList,
  },
  {
    label: "Invoices",
    href: "/customer/invoices",
    icon: FileText,
  },
  {
    label: "Payments",
    href: "/customer/payments",
    icon: CreditCard,
  },
  {
    label: "Premium",
    href: "/customer/premium",
    icon: Sparkles,
  },
  {
    label: "History",
    href: "/customer/history",
    icon: History,
  },
  {
    label: "Notifications",
    href: "/customer/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    href: "/customer/profile",
    icon: UserCog,
  },
];

export const TECHNICIAN_LINKS: DashboardLink[] = [
  {
    label: "Dashboard",
    href: "/technician",
    icon: LayoutDashboard,
  },
  {
    label: "My Tasks",
    href: "/technician/tasks",
    icon: ClipboardList,
  },
  {
    label: "Schedule",
    href: "/technician/schedule",
    icon: Calendar,
  },
  {
    label: "Notifications",
    href: "/technician/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    href: "/technician/profile",
    icon: UserCog,
  },
];

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    links: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Dispatch",
        href: "/admin/dispatch",
        icon: CalendarCheck,
      },
      {
        label: "Work Orders",
        href: "/admin/work-orders",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: "Finance",
    links: [
      {
        label: "Invoices",
        href: "/admin/invoices",
        icon: FileText,
      },
      {
        label: "Payments",
        href: "/admin/payments",
        icon: Wallet,
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        icon: Crown,
      },
    ],
  },
  {
    label: "People and Setup",
    links: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Technicians",
        href: "/admin/technicians",
        icon: Wrench,
      },
      {
        label: "Catalog",
        href: "/admin/catalog",
        icon: Layers,
      },
      {
        label: "Feedback",
        href: "/admin/feedback",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "System",
    links: [
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ScrollText,
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        label: "Profile",
        href: "/admin/profile",
        icon: UserCog,
      },
    ],
  },
];

export const ADMIN_LINKS: DashboardLink[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.links,
);

export const ROLE_DASHBOARD_LINKS: Record<Role, DashboardLink[]> = {
  CUSTOMER: CUSTOMER_LINKS,
  TECHNICIAN: TECHNICIAN_LINKS,
  ADMIN: ADMIN_LINKS,
};

export const ROLE_DASHBOARD_GROUPS: Partial<Record<Role, NavGroup[]>> = {
  ADMIN: ADMIN_NAV_GROUPS,
};
