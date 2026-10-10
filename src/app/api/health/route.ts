import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Health check endpoint for deployment monitoring.
 * Returns HTTP 200 { status: "ok" } with no-store cache control.
 * Strictly decoupled from the backend API.
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok" },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
