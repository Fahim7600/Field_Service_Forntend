import { cookies } from "next/headers";
import type React from "react";
import { DashboardLayout as DashboardShell } from "@/components/layout/dashboard-layout";
import { FS_COOKIE_ROLE } from "@/lib/session-cookies";
import type { Role } from "@/types/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get(FS_COOKIE_ROLE)?.value?.toUpperCase();
  const role: Role =
    rawRole === "ADMIN" || rawRole === "TECHNICIAN" || rawRole === "CUSTOMER"
      ? rawRole
      : "CUSTOMER";

  return <DashboardShell role={role}>{children}</DashboardShell>;
}
