import type { Metadata } from "next";
import { CustomerHistoryClient } from "@/components/customer/customer-history-client";

export const metadata: Metadata = {
  title: "Service History | Customer Portal",
  description: "View past completed service requests and paid invoices.",
};

export default function CustomerHistoryPage() {
  return <CustomerHistoryClient />;
}
