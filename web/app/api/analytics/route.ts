import { NextRequest, NextResponse } from "next/server";

/** Allowlist — unknown names are rejected so random clients can't spam arbitrary keys. */
const ALLOWED = new Set<string>([
  "page_view",
  "filter_apply",
  "filter_clear",
  "pagination",
  "listing_click",
  "hero_cta_meet_hamsters",
  "hero_cta_rehome",
  "nav_browse",
  "nav_map",
  "nav_rehome",
  "nav_home",
  "map_view",
  "map_browse_grid_click",
  "map_listing_click",
  "detail_back_to_browse",
  "contact_intent_click",
]);

/**
 * Append-only ingestion for client ``trackEvent`` calls. Logs a single JSON
 * line per request; grep / ship logs to BigQuery / Axiom / etc. when ready.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const name = (body as { name?: unknown }).name;
  if (typeof name !== "string" || !ALLOWED.has(name)) {
    return NextResponse.json({ error: "invalid event name" }, { status: 400 });
  }

  // Single-line JSON for log aggregators; `userAgent` comes from edge only when available
  const ua = req.headers.get("user-agent") ?? undefined;
  // eslint-disable-next-line no-console -- ingestion sink for observability
  console.info(
    JSON.stringify({
      source: "hamstr_analytics",
      ...((body as Record<string, unknown>) ?? {}),
      userAgent: ua,
    }),
  );

  return new NextResponse(null, { status: 204 });
}
