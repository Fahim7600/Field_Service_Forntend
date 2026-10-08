"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Plus,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatSafeDate } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { financeService } from "@/services/finance.service";
import { requestsService } from "@/services/requests.service";

export function CustomerDashboardOverview() {
  const { data: requestsData, isLoading: isRequestsLoading } = useQuery({
    queryKey: ["customer-overview-requests"],
    queryFn: () => requestsService.fetchMyRequests({ page: 1, limit: 5 }),
    staleTime: 15000,
  });

  const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["customer-overview-invoices"],
    queryFn: () => financeService.fetchInvoices({ page: 1, limit: 5 }),
    staleTime: 15000,
  });

  const { data: subscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => financeService.fetchMySubscription(),
    staleTime: 30000,
  });

  const requests = requestsData?.data || [];
  const invoices = invoicesData?.data || [];
  const pendingInvoices = invoices.filter((inv) => inv.status === "ISSUED");
  const isVip = subscription?.status === "ACTIVE";

  const totalActiveRequests = requests.filter(
    (r) => r.status !== "COMPLETED" && r.status !== "CANCELLED",
  ).length;

  return (
    <div className="space-y-6">
      {/* Top 3 Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Active Requests */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Requests
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {isRequestsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                totalActiveRequests
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Under review or dispatched</span>
              <Link
                href="/customer/requests"
                className="text-primary font-semibold hover:underline"
              >
                View all →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Pending Invoices */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Payment Due
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-bold font-heading text-foreground">
              {isInvoicesLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                pendingInvoices.length
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Awaiting settlement</span>
              <Link
                href="/customer/invoices"
                className="text-primary font-semibold hover:underline"
              >
                Pay now →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Membership Status */}
        <Card className="border-border bg-card shadow-xs transition-all hover:border-primary/40">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              VIP Membership
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Crown className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-lg font-bold font-heading text-foreground flex items-center gap-2">
              {isVip ? (
                <>
                  <span>Active VIP</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                  >
                    10% OFF
                  </Badge>
                </>
              ) : (
                <span>Standard</span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>
                {isVip
                  ? "Priority dispatch enabled"
                  : "Unlock 10% labor discount"}
              </span>
              <Link
                href="/customer/premium"
                className="text-primary font-semibold hover:underline"
              >
                {isVip ? "View perks →" : "Upgrade →"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action CTA + Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Booking Banner */}
        <Card className="border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="size-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-2">
              <Wrench className="size-5" />
            </div>
            <CardTitle className="text-base font-bold text-foreground font-heading">
              Need a Repair or Maintenance?
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Book certified technicians with live arrival updates, transparent
              itemized pricing, and rapid response.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>Plumbing, HVAC, Electrical & Appliance repairs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              <span>Real-time GPS tracking & service completion reports</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-5">
            <Link
              href="/customer/requests/new"
              className={cn(
                buttonVariants({ variant: "cta", size: "default" }),
                "w-full justify-center gap-2 font-semibold shadow-xs",
              )}
            >
              <Plus className="size-4" />
              <span>Book New Service</span>
            </Link>
          </CardFooter>
        </Card>

        {/* Right: Recent Service Requests */}
        <Card className="lg:col-span-2 border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/80 bg-panel/50 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarCheck className="size-4 text-primary" />
                <span>Recent Service Requests</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Status of your booked appointments and dispatched technicians.
              </CardDescription>
            </div>
            <Link
              href="/customer/requests"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isRequestsLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                You haven't filed any service requests yet. Click "Book New
                Service" to get started.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {requests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {req.title}
                        </span>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Category: {req.category?.name || "General"}</span>
                        <span>Date: {formatSafeDate(req.createdAt)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/customer/requests/${req.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-1 shrink-0",
                      )}
                    >
                      <span>Track</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
