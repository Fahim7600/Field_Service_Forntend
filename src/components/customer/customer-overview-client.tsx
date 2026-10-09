"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  Plus,
  Receipt,
  RefreshCw,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { usePremiumStatus } from "@/hooks/use-premium-status";
import { extractArray } from "@/lib/extract-data";
import { formatMoney, safeFormatDate, safeFormatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getDisplayStatus } from "@/lib/work-order-rules";
import { financeService } from "@/services/finance.service";
import { requestsService } from "@/services/requests.service";
import { workOrdersService } from "@/services/work-orders.service";
import type { CustomerRequestListItem, InvoiceSummary } from "@/types/api";
import type { WorkOrder } from "@/types/work-order";

export function CustomerOverviewClient() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.trim().split(" ")[0] : "";

  // 1. Stat Card 1: Awaiting Review
  const {
    data: awaitingData,
    isLoading: isAwaitingLoading,
    isError: isAwaitingError,
    refetch: refetchAwaiting,
  } = useQuery({
    queryKey: ["customer-overview", "awaiting-review"],
    queryFn: () =>
      requestsService.fetchMyRequests({ status: "SUBMITTED", limit: 1 }),
    staleTime: 30_000,
  });

  // 2. Stat Card 2 & Next Visit Spotlight: Upcoming Visits
  const {
    data: upcomingData,
    isLoading: isUpcomingLoading,
    isError: isUpcomingError,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ["customer-overview", "upcoming-visits"],
    queryFn: () =>
      workOrdersService.fetchWorkOrders({
        status: "SCHEDULED",
        sortBy: "visitStart",
        order: "asc",
        limit: 5,
      }),
    staleTime: 30_000,
  });

  // 3. Stat Card 3: Unpaid Invoices
  const {
    data: invoicesData,
    isLoading: isInvoicesLoading,
    isError: isInvoicesError,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["customer-overview", "unpaid-invoices"],
    queryFn: () => financeService.fetchInvoices({ status: "ISSUED", limit: 5 }),
    staleTime: 30_000,
  });

  // 4. Stat Card 4: Premium Status
  const {
    isPremium,
    subscription,
    isLoading: isPremiumLoading,
    refetch: refetchPremium,
  } = usePremiumStatus();

  // 5. Recent Service Requests
  const {
    data: recentRequestsData,
    isLoading: isRecentLoading,
    isError: isRecentError,
    refetch: refetchRecent,
  } = useQuery({
    queryKey: ["customer-overview", "recent-requests"],
    queryFn: () =>
      requestsService.fetchMyRequests({
        limit: 5,
        sortBy: "createdAt",
        order: "desc",
      }),
    staleTime: 30_000,
  });

  const awaitingTotal = awaitingData?.pagination?.total ?? 0;
  const upcomingTotal = upcomingData?.pagination?.total ?? 0;
  const upcomingItems = extractArray<WorkOrder>(upcomingData);
  const nextVisit = upcomingItems[0] || null;

  const unpaidTotal = invoicesData?.pagination?.total ?? 0;
  const unpaidItems = extractArray<InvoiceSummary>(invoicesData);
  const isAllUnpaidLoaded =
    invoicesData?.pagination?.total === unpaidItems.length;
  const unpaidSumCents = isAllUnpaidLoaded
    ? unpaidItems.reduce((acc, inv) => acc + (inv.totalCents || 0), 0)
    : null;

  const recentRequests =
    extractArray<CustomerRequestListItem>(recentRequestsData);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-xs">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Welcome back{firstName ? `, ${firstName}` : ""}</span>
            <Sparkles className="size-5 text-brand-500 fill-brand-500/20" />
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your service appointments, track technician arrivals, and
            review billing statements.
          </p>
        </div>

        <Link
          href="/customer/requests/new"
          className={cn(
            buttonVariants({ variant: "cta", size: "default" }),
            "gap-2 font-semibold shadow-xs shrink-0",
          )}
        >
          <Plus className="size-4" />
          <span>Book Service</span>
        </Link>
      </div>

      {/* 4 Independent Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Awaiting Review */}
        <Card className="border border-border bg-card shadow-xs transition-all hover:border-border/80">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Awaiting Review
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isAwaitingLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isAwaitingError ? (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <span>Failed</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => refetchAwaiting()}
                  className="h-5 px-1.5"
                >
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="text-2xl font-bold font-heading text-foreground">
                {awaitingTotal}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Pending triage</span>
              <Link
                href="/customer/requests?status=SUBMITTED"
                className="text-primary font-semibold hover:underline"
              >
                View →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Upcoming Visits */}
        <Card className="border border-border bg-card shadow-xs transition-all hover:border-border/80">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming Visits
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isUpcomingLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isUpcomingError ? (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <span>Failed</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => refetchUpcoming()}
                  className="h-5 px-1.5"
                >
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="text-2xl font-bold font-heading text-foreground">
                {upcomingTotal}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>Confirmed jobs</span>
              <Link
                href="/customer/requests"
                className="text-primary font-semibold hover:underline"
              >
                Schedule →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Unpaid Invoices */}
        <Card className="border border-border bg-card shadow-xs transition-all hover:border-border/80">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unpaid Invoices
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isInvoicesLoading ? (
              <Skeleton className="h-8 w-14" />
            ) : isInvoicesError ? (
              <div className="flex items-center gap-2 text-xs text-destructive">
                <span>Failed</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => refetchInvoices()}
                  className="h-5 px-1.5"
                >
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="text-2xl font-bold font-heading text-foreground">
                {unpaidTotal}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
              <span>
                {unpaidSumCents !== null && unpaidSumCents > 0
                  ? `Due: ${formatMoney(unpaidSumCents)}`
                  : "Awaiting settlement"}
              </span>
              <Link
                href="/customer/invoices"
                className="text-primary font-semibold hover:underline"
              >
                Billing →
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Premium Plan */}
        <Card className="border border-border bg-card shadow-xs transition-all hover:border-border/80">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Membership
            </CardTitle>
            <div className="size-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Crown className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {isPremiumLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : isPremium === true ? (
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  Premium Active
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {subscription?.currentPeriodEnd
                    ? `Renews ${safeFormatDate(subscription.currentPeriodEnd)}`
                    : "Priority dispatch enabled"}
                </p>
              </div>
            ) : isPremium === false ? (
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-foreground">
                  Free Plan
                </div>
                <Link
                  href="/customer/premium"
                  className={cn(
                    buttonVariants({ variant: "cta", size: "xs" }),
                    "text-[11px] font-semibold h-6 px-2 shadow-2xs",
                  )}
                >
                  <Crown className="size-3" />
                  <span>Upgrade</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Unavailable</span>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => refetchPremium()}
                  className="h-5 px-1.5"
                >
                  <RefreshCw className="size-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spotlight & Recent Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Next Visit Spotlight */}
        <Card className="border border-border bg-card shadow-xs flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Calendar className="size-4 text-primary" />
              <span>Next Scheduled Visit</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Your nearest upcoming field technician visit.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 flex-1 flex flex-col justify-center">
            {isUpcomingLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : nextVisit ? (
              <div className="space-y-4">
                <div className="p-3 bg-brand-500/5 dark:bg-brand-950/30 rounded-xl border border-brand-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600">
                      #{nextVisit.workOrderNumber || nextVisit.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={nextVisit.status} />
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
                      Confirmed Visit Time
                    </span>
                    <p className="font-bold text-sm text-foreground">
                      {safeFormatDateTime(
                        nextVisit.visitStart || nextVisit.scheduledDate,
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-foreground font-medium pt-1">
                    <User className="size-3.5 text-muted-foreground shrink-0" />
                    <span>
                      {nextVisit.technician &&
                      "name" in nextVisit.technician &&
                      typeof nextVisit.technician.name === "string"
                        ? nextVisit.technician.name
                        : nextVisit.technician &&
                            "user" in nextVisit.technician &&
                            nextVisit.technician.user &&
                            typeof (
                              nextVisit.technician.user as { name?: string }
                            ).name === "string"
                          ? (nextVisit.technician.user as { name: string }).name
                          : "Technician Assigned"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/customer/requests/${nextVisit.serviceRequestId || nextVisit.requestId || nextVisit.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "w-full justify-center gap-1.5 text-xs font-semibold",
                  )}
                >
                  <span>View Job &amp; Location</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Calendar className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">
                    No upcoming visits
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                    You have no active technician visits scheduled at this time.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Recent Requests */}
        <Card className="lg:col-span-2 border border-border bg-card shadow-xs overflow-hidden">
          <CardHeader className="border-b border-border/80 bg-muted/20 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Wrench className="size-4 text-primary" />
                <span>Recent Service Requests</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Status of your booked repairs and dispatch progress.
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
            {isRecentLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : isRecentError ? (
              <div className="p-6 text-center text-xs text-destructive space-y-2">
                <p>Failed to load recent requests.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRecent()}
                  className="h-7 text-xs"
                >
                  Retry
                </Button>
              </div>
            ) : recentRequests.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  You have not submitted any service requests yet.
                </p>
                <Link
                  href="/customer/requests/new"
                  className={cn(
                    buttonVariants({ variant: "cta", size: "sm" }),
                    "text-xs font-semibold",
                  )}
                >
                  <Plus className="size-3.5 mr-1" />
                  <span>Book Your First Service</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-muted-foreground">
                          #{req.requestNumber || req.id.slice(0, 8)}
                        </span>
                        <span className="font-bold text-sm text-foreground truncate">
                          {req.title}
                        </span>
                        <StatusBadge status={getDisplayStatus(req)} />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>Category: {req.category?.name || "General"}</span>
                        <span>Date: {safeFormatDate(req.createdAt)}</span>
                      </div>
                    </div>

                    <Link
                      href={`/customer/requests/${req.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "gap-1 shrink-0 text-xs",
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
