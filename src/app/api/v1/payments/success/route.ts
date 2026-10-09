/**
 * Payment Success Return Route Handler
 *
 * WHY THIS ROUTE EXISTS:
 * When a customer finishes paying on Stripe Checkout, Stripe redirects their browser to:
 * `${PUBLIC_API_URL}/api/v1/payments/success?session_id={CHECKOUT_SESSION_ID}`.
 * The backend implementation of this endpoint returns raw JSON data and does NOT perform an HTTP redirect.
 * Because PUBLIC_API_URL is configured to the frontend origin in deployment, this Next.js filesystem route
 * handler takes precedence over the `/api/:path*` rewrite in next.config.ts, extracts the Stripe session_id,
 * and smoothly redirects the customer to our dedicated frontend confirmation page `/payment/success`.
 */

import { type NextRequest, NextResponse } from "next/server";
import { parseSessionId } from "@/lib/session-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSessionId = searchParams.get("session_id");
  const validSessionId = parseSessionId(rawSessionId);

  const destination = new URL("/payment/success", request.nextUrl.origin);
  if (validSessionId) {
    destination.searchParams.set("session_id", validSessionId);
  }

  // 303 See Other ensures GET navigation to the destination page
  return NextResponse.redirect(destination, 303);
}
