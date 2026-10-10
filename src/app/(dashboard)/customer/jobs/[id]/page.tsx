import type { Metadata } from "next";
import { CustomerJobResolver } from "./customer-job-resolver";

export const metadata: Metadata = {
  title: "Opening Job",
  robots: {
    index: false,
    follow: false,
  },
};

interface CustomerJobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CustomerJobPage({
  params,
}: CustomerJobPageProps) {
  const { id } = await params;
  return <CustomerJobResolver id={id} />;
}
