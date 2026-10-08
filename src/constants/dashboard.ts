import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  CalendarCheck,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface DashboardLink {
  label: string;
  href: string;
  icon: LucideIcon;
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
    label: "History",
    href: "/customer/history",
    icon: History,
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
];

export const ADMIN_LINKS: DashboardLink[] = [
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
    label: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export const ROLE_DASHBOARD_LINKS: Record<Role, DashboardLink[]> = {
  CUSTOMER: CUSTOMER_LINKS,
  TECHNICIAN: TECHNICIAN_LINKS,
  ADMIN: ADMIN_LINKS,
};
