"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export interface DashboardWelcomeHeaderProps {
  title: string;
  description: string;
}

export function DashboardWelcomeHeader({
  title: _title,
  description,
}: DashboardWelcomeHeaderProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  const name = user?.name || "User";

  return <PageHeader title={`Welcome, ${name}`} description={description} />;
}
