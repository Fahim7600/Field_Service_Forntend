/**
 * Subscription Success Return Route Handler
 *
 * WHY THIS ROUTE EXISTS:
 * When a customer finishes purchasing a premium subscription on Stripe, Stripe redirects to:
 * `${PUBLIC_API_URL}/api/v1/subscriptions/success?session_id={CHECKOUT_SESSION_ID}`.
 * This Next.js filesystem route handler takes precedence over the `/api/:path*` rewrite,
 * and redirects the customer to the premium dashboard with confirmation parameters.
 */

import { type NextRequest, NextResponse } from "next/server";
import { parseSessionId } from "@/lib/session-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSessionId = searchParams.get("session_id");
  const validSessionId = parseSessionId(rawSessionId);

  const destination = new URL("/customer/premium", request.nextUrl.origin);
  destination.searchParams.set("checkout", "success");
  if (validSessionId) {
    destination.searchParams.set("session_id", validSessionId);
  }

  return NextResponse.redirect(destination, 303);
}
