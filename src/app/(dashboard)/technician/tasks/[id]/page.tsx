import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/shared/container";
import { TaskDetailClient } from "@/components/technician/task-detail-client";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Task #${id.slice(0, 8)} | Technician Workflow`,
    description:
      "View job specifications, update live progress, and file service completion reports.",
  };
}

export default async function TechnicianTaskDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Container className="py-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          </div>
        }
      >
        <TaskDetailClient id={id} />
      </Suspense>
    </Container>
  );
}
