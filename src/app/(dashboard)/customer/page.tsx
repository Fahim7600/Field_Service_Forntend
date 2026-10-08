import type { Metadata } from "next";
import { TempSessionCard } from "@/components/shared/temp-session-card";

export const metadata: Metadata = {
  title: "Customer Portal",
  description:
    "Field Service customer portal for booking and service tracking.",
};

// TEMPORARY: Temporary landing page for CUSTOMER role.
// Will be replaced by full customer service hub in subsequent milestones.
export default function CustomerDashboardPage() {
  return (
    <TempSessionCard expectedRole="CUSTOMER" dashboardTitle="Customer Portal" />
  );
}
