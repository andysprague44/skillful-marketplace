"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MouseEvent } from "react";
import { trackEvent } from "@/lib/analytics";
import { BrowseFilters } from "./BrowseControls";

/**
 * Pagination for the browse grid.
 *
 * Each Prev/Next link is a real ``<Link>`` with a shareable href so the
 * page is still bookmarkable / deep-linkable. Clicks are intercepted to
 * call ``router.push(..., { scroll: false })`` so:
 *
 *   - Next.js doesn't auto-scroll to the ``#hamsters`` hash (which would
 *     jump the viewport and feel jarring against a quick card swap).
 *   - The PageTransition curtain stays down (it skips search-only navs).
 *   - The grid component picks up the new ``page`` prop and runs its own
 *     slide-in animation, so the new cards appear to glide in from the
 *     right while the rest of the page stays exactly where it was.
 */
export function Pagination({
  filters,
  total,
  page,
  pageSize,
}: {
  filters: BrowseFilters;
  total: number;
  page: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const existing = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams(existing?.toString() || "");
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(targetPage));
    }
    // Preserve filters even if they came from controlled state rather than URL.
    setIfPresent(params, "species", filters.species);
    setIfPresent(params, "gender", filters.gender);
    setIfPresent(params, "location", filters.location);
    const qs = params.toString();
    // Keep the #hamsters anchor in the href for shareability — but
    // ``scroll: false`` on the click handler stops the browser from
    // jumping to it.
    return qs ? `/?${qs}#hamsters` : "/#hamsters";
  }

  function onPagerNav(e: MouseEvent<HTMLAnchorElement>, href: string) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;
    e.preventDefault();
    let toPage = 1;
    try {
      const u = new URL(href, window.location.origin);
      const p = u.searchParams.get("page");
      toPage =
        p && Number.isFinite(Number(p)) ? Math.max(1, Math.floor(Number(p))) : 1;
    } catch {
      toPage = 1;
    }
    const direction = toPage > page ? "next" : "prev";
    trackEvent("pagination", {
      from_page: page,
      to_page: toPage,
      direction,
    });
    router.push(href, { scroll: false });
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      className="flex w-full items-center justify-between gap-3"
      aria-label="Pagination"
    >
      <PagerLink
        href={hrefFor(page - 1)}
        disabled={prevDisabled}
        label="← Prev"
        onNav={onPagerNav}
      />
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        Page {page} of {totalPages}
      </p>
      <PagerLink
        href={hrefFor(page + 1)}
        disabled={nextDisabled}
        label="Next →"
        onNav={onPagerNav}
      />
    </nav>
  );
}

function setIfPresent(
  params: URLSearchParams,
  key: string,
  value: string | null | undefined,
): void {
  if (value && value !== "") params.set(key, value);
}

function PagerLink({
  href,
  disabled,
  label,
  onNav,
}: {
  href: string;
  disabled: boolean;
  label: string;
  onNav: (e: MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  if (disabled) {
    return (
      <span
        className="rounded-full px-5 py-2 text-xs font-bold tracking-wide opacity-40"
        style={{
          border:
            "1px solid color-mix(in srgb, var(--teal-dark) 25%, transparent)",
          color: "var(--teal-dark)",
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      onClick={(e) => onNav(e, href)}
      className="rounded-full px-5 py-2 text-xs font-bold tracking-wide text-white"
      style={{ background: "var(--teal-dark)" }}
    >
      {label}
    </Link>
  );
}
