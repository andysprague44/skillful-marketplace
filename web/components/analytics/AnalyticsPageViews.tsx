"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Fires ``page_view`` on every App Router navigation (pathname + query).
 * Lives in the root layout inside ``<Suspense>`` because
 * ``useSearchParams`` opts the subtree into client streaming.
 */
export function AnalyticsPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    trackEvent("page_view", {
      pathname,
      search: search || undefined,
    });
  }, [pathname, search]);

  return null;
}
