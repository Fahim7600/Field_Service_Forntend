/**
 * Payment Verification Status API Proxy
 *
 * Provides a clean JSON verification endpoint for client-side polling on the payment
 * confirmation page (/payment/success) without triggering browser redirect loops.
 */

import { type NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/server-env";
import { parseSessionId } from "@/lib/session-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rawSessionId = searchParams.get("session_id");
  const sessionId = parseSessionId(rawSessionId);

  if (!sessionId) {
    return NextResponse.json(
      {
        success: false,
        message: "A valid session_id query parameter is required.",
      },
      { status: 400 },
    );
  }

  const backendUrl = getBackendUrl();

  try {
    const upstreamRes = await fetch(
      `${backendUrl}/api/v1/payments/success?session_id=${encodeURIComponent(sessionId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    const contentType = upstreamRes.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message: "Upstream server returned non-JSON response.",
        },
        { status: 502 },
      );
    }

    const data = await upstreamRes.json();
    return NextResponse.json(data, { status: upstreamRes.status });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "Failed to connect to backend payment verification service.",
      },
      { status: 502 },
    );
  }
}
