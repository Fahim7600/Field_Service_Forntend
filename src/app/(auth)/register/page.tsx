import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/register-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your Field Service customer account.",
  robots: {
    index: false,
    follow: false,
  },
};

function RegisterFormSkeleton() {
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
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFormSkeleton />}>
      <RegisterForm />
    </Suspense>
  );
}
