/**
 * Lightweight first-party eventing: fire-and-forget POSTs to ``/api/analytics``.
 *
 * Events land in server stdout (Vercel / Railway logs) as JSON lines; wire
 * an external collector later without changing callers
 * (`NEXT_PUBLIC_ANALYTICS_ENDPOINT` is reserved for a future forwarder).
 *
 * A per-tab ``sessionStorage`` id correlates events for funnel-style reads.
 * Set ``NEXT_PUBLIC_ANALYTICS_DEBUG=1`` to mirror payloads to the console.
 */

export type AnalyticsEventName =
  | "page_view"
  | "filter_apply"
  | "filter_clear"
  | "pagination"
  | "listing_click"
  | "hero_cta_meet_hamsters"
  | "hero_cta_rehome"
  | "nav_browse"
  | "nav_map"
  | "nav_rehome"
  | "nav_home"
  | "map_view"
  | "map_browse_grid_click"
  | "map_listing_click"
  | "detail_back_to_browse"
  | "contact_intent_click";

const SESSION_KEY = "hamstr_analytics_sid";

function sessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;

  const payload = {
    name,
    properties: properties ?? {},
    path: window.location.pathname,
    search: window.location.search || undefined,
    referrer: document.referrer || undefined,
    ts: new Date().toISOString(),
    sid: sessionId(),
  };

  if (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "1") {
    // eslint-disable-next-line no-console -- intentional dev aid
    console.debug("[analytics]", payload);
  }

  const url = `${window.location.origin}/api/analytics`;
  const body = JSON.stringify(payload);

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    /* swallow — analytics must never break UX */
  });
}
