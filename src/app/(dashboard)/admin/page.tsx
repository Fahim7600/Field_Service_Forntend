import type { Metadata } from "next";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";

export const metadata: Metadata = {
  title: "Admin Command Center",
  description: "Field Service administrator dispatch and control dashboard.",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader
        title="Admin Command Center"
        description="Overview of field operations, active dispatches, and technician status."
      />
    </div>
  );
}
