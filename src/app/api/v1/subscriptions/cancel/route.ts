/**
 * Subscription Cancel Return Route Handler
 *
 * WHY THIS ROUTE EXISTS:
 * When a customer cancels a premium subscription checkout on Stripe, Stripe redirects to:
 * `${PUBLIC_API_URL}/api/v1/subscriptions/cancel?session_id={CHECKOUT_SESSION_ID}`.
 * This Next.js filesystem route handler takes precedence over the `/api/:path*` rewrite,
 * and redirects the customer to the premium dashboard with cancellation parameter.
 */

import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const destination = new URL("/customer/premium", request.nextUrl.origin);
  destination.searchParams.set("checkout", "cancelled");

  return NextResponse.redirect(destination, 303);
}
