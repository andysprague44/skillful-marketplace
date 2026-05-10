"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

/**
 * Client wrapper so we can log when someone leaves a detail page for
 * the browse grid without re-shelling the entire detail route.
 */
export function DetailBackToBrowseLink({
  fg,
  children,
}: {
  fg: string;
  children: ReactNode;
}) {
  return (
    <Link
      href="/#hamsters"
      onClick={() => trackEvent("detail_back_to_browse")}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
      style={{
        background: "color-mix(in srgb, currentColor 10%, transparent)",
        color: fg,
      }}
    >
      {children}
    </Link>
  );
}
