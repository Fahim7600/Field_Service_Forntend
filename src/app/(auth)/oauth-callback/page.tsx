import type { Metadata } from "next";
import { Suspense } from "react";
import { OAuthCallbackHandler } from "@/components/forms/oauth-callback-handler";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Signing in...",
  robots: {
    index: false,
    follow: false,
  },
};

function OAuthCallbackSkeleton() {
  return (
    <div className="bg-card w-full rounded-2xl p-8 border border-border shadow-xs text-center space-y-4">
      <Skeleton className="size-12 rounded-full mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackSkeleton />}>
      <OAuthCallbackHandler />
    </Suspense>
  );
}
