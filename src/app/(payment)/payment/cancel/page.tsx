import { FileText, Home, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { parseSessionId } from "@/lib/session-id";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Payment Cancelled | Field Service",
  description: "Your payment session was cancelled.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PaymentCancelPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const validSessionId = parseSessionId(session_id);

  let invoiceId: string | null = null;
  if (validSessionId) {
    const backendUrl =
      process.env.BACKEND_URL || "https://field-service-d24g.onrender.com";
    try {
      const res = await fetch(
        `${backendUrl}/api/v1/payments/success?session_id=${encodeURIComponent(validSessionId)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.invoiceId) {
          invoiceId = String(json.data.invoiceId);
        }
      }
    } catch {
      // Graceful fallback to invoices list
    }
  }

  const invoiceUrl = invoiceId
    ? `/customer/invoices/${invoiceId}`
    : "/customer/invoices";

  return (
    <Card className="border-border bg-card shadow-lg text-center overflow-hidden">
      <div className="h-2 bg-destructive w-full" />
      <CardHeader className="pt-8 pb-4 space-y-4">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto ring-8 ring-destructive/5">
          <XCircle className="size-10" />
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">
            Payment Cancelled
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            You cancelled the checkout. No charge was made and your invoice
            remains unpaid.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-6 text-xs text-muted-foreground border-y border-border/60 py-4 bg-muted/20">
        <p>
          You can return to your invoice at any time to resume payment through
          Stripe.
        </p>
      </CardContent>

      <CardFooter className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center">
        <Link
          href={invoiceUrl}
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "w-full sm:w-auto gap-2 font-semibold",
          )}
        >
          <FileText className="size-4" />
          <span>{invoiceId ? "Try Again" : "View Invoices"}</span>
        </Link>
        <Link
          href="/customer"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "w-full sm:w-auto gap-2 font-medium",
          )}
        >
          <Home className="size-4" />
          <span>Return to Dashboard</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
