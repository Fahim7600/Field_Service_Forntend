import type { Metadata } from "next";
import { TempSessionCard } from "@/components/shared/temp-session-card";

export const metadata: Metadata = {
  title: "Admin Command Center",
  description: "Field Service administrator dispatch and control dashboard.",
};

// TEMPORARY: Temporary landing page for ADMIN role.
// Will be replaced by full administrative management console in subsequent milestones.
export default function AdminDashboardPage() {
  return (
    <TempSessionCard
      expectedRole="ADMIN"
      dashboardTitle="Admin Command Center"
    />
  );
}
