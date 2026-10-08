import type { Metadata } from "next";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";

export const metadata: Metadata = {
  title: "Technician Workspace",
  description:
    "Field Service technician mobile schedule and work order console.",
};

export default function TechnicianDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader
        title="Technician Workspace"
        description="Your daily schedule, assigned jobs, and route navigation."
      />
    </div>
  );
}
