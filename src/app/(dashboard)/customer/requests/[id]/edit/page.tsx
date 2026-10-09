import type { Metadata } from "next";
import { EditRequestClient } from "@/components/customer/edit-request-client";

export const metadata: Metadata = {
  title: "Edit Service Request | Customer Portal",
  description: "Update details for your pending service request",
};

interface EditRequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRequestPage({
  params,
}: EditRequestPageProps) {
  const { id } = await params;
  return <EditRequestClient id={id} />;
}
