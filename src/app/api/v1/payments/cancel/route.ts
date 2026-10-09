/**
 * Payment Cancel Return Route Handler
 *
 * WHY THIS ROUTE EXISTS:
 * When a customer cancels Stripe Checkout, Stripe redirects their browser to:
 * `${PUBLIC_API_URL}/api/v1/payments/cancel?session_id={CHECKOUT_SESSION_ID}`.
 * The backend implementation of this endpoint returns raw JSON data and does NOT perform an HTTP redirect.
 * This Next.js filesystem route handler takes precedence over the `/api/:path*` rewrite in next.config.ts,
 * extracts the Stripe session_id, and redirects the customer to our frontend cancellation page `/payment/cancel`.
 */

import { type NextRequest, NextResponse } from "next/server";
import { parseSessionId } from "@/lib/session-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSessionId = searchParams.get("session_id");
  const validSessionId = parseSessionId(rawSessionId);

  const destination = new URL("/payment/cancel", request.nextUrl.origin);
  if (validSessionId) {
    destination.searchParams.set("session_id", validSessionId);
  }

  return NextResponse.redirect(destination, 303);
}
