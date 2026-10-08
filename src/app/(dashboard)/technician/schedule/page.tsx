import type { Metadata } from "next";
import { TechnicianScheduleClient } from "@/components/technician/technician-schedule-client";

export const metadata: Metadata = {
  title: "Schedule | Technician Portal",
  description: "View scheduled service visits and route timeline.",
};

export default function TechnicianSchedulePage() {
  return <TechnicianScheduleClient />;
}
