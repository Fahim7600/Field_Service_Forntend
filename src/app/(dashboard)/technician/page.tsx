import type { Metadata } from "next";
import { TempSessionCard } from "@/components/shared/temp-session-card";

export const metadata: Metadata = {
  title: "Technician Workspace",
  description:
    "Field Service technician mobile schedule and work order console.",
};

// TEMPORARY: Temporary landing page for TECHNICIAN role.
// Will be replaced by full technician workspace in subsequent milestones.
export default function TechnicianDashboardPage() {
  return (
    <TempSessionCard
      expectedRole="TECHNICIAN"
      dashboardTitle="Technician Workspace"
    />
  );
}
