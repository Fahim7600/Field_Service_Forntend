import { type LucideIcon, ShieldCheck, User, Wrench } from "lucide-react";
import type { Role } from "@/types/auth";

export interface DemoAccount {
  role: Role;
  label: string;
  description: string;
  icon: LucideIcon;
  email?: string;
  password?: string;
  isAvailable: boolean;
}

const adminEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
const adminPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;

const customerEmail = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_EMAIL;
const customerPassword = process.env.NEXT_PUBLIC_DEMO_CUSTOMER_PASSWORD;

const technicianEmail = process.env.NEXT_PUBLIC_DEMO_TECHNICIAN_EMAIL;
const technicianPassword = process.env.NEXT_PUBLIC_DEMO_TECHNICIAN_PASSWORD;

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "ADMIN",
    label: "Admin Dispatcher",
    description: "Manage work orders, team dispatching, and system billing.",
    icon: ShieldCheck,
    email: adminEmail,
    password: adminPassword,
    isAvailable: Boolean(adminEmail && adminPassword),
  },
  {
    role: "CUSTOMER",
    label: "Customer",
    description: "Book service requests, track appointments, and pay invoices.",
    icon: User,
    email: customerEmail,
    password: customerPassword,
    isAvailable: Boolean(customerEmail && customerPassword),
  },
  {
    role: "TECHNICIAN",
    label: "Field Technician",
    description:
      "Execute assigned work orders, update checklists, and record parts.",
    icon: Wrench,
    email: technicianEmail,
    password: technicianPassword,
    isAvailable: Boolean(technicianEmail && technicianPassword),
  },
];
