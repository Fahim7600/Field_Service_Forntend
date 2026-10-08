import { Plus, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DashboardWelcomeHeader } from "@/components/dashboard/dashboard-welcome-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer Portal",
  description:
    "Field Service customer portal for booking and service tracking.",
};

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader
        title="Customer Portal"
        description="Book services, track technician arrival, and view past job history."
        actions={
          <Link
            href="/customer/requests/new"
            className={cn(buttonVariants({ variant: "cta", size: "sm" }))}
          >
            <Plus className="size-4 mr-1.5" />
            Book a Service
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border bg-card shadow-xs hover:border-brand-500/50 transition-colors">
          <CardContent className="p-6 space-y-4">
            <div className="size-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <Wrench className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-charcoal-900">
                Need a Repair or Maintenance?
              </h3>
              <p className="text-xs text-charcoal-600">
                Book certified technicians with live arrival updates and upfront
                pricing.
              </p>
            </div>
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "w-full",
              )}
            >
              Start New Request
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
