import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { Skeleton } from "@/components/ui/skeleton";
import { FS_COOKIE_MUST_CHANGE } from "@/lib/session-cookies";

export const metadata: Metadata = {
  title: "Change Password",
  description: "Update your Field Service account password.",
  robots: {
    index: false,
    follow: false,
  },
};

function ChangePasswordSkeleton() {
  return (
    <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-xs space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default async function ChangePasswordPage() {
  const cookieStore = await cookies();
  const mustChange = cookieStore.get(FS_COOKIE_MUST_CHANGE)?.value === "1";

  return (
    <Suspense fallback={<ChangePasswordSkeleton />}>
      <ChangePasswordForm mustChange={mustChange} />
    </Suspense>
  );
}
