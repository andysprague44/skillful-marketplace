"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/components/motion/SmoothScroll";
import { HamstrWordmark } from "@/components/HamstrWordmark";
import { StaggerHoverLink } from "@/components/nav/StaggerHoverLink";
import { trackEvent } from "@/lib/analytics";

/** Hash-target on the home page that the Browse pill scrolls to. */
const BROWSE_HASH = "#hamsters";
/** Vertical offset (px) so the section title clears the sticky header. */
const SCROLL_OFFSET = -72;

/**
 * Sticky top nav. Reads the in-view section's `data-tone` and recolors
 * itself for legibility. Mirrors Tesoro's nav: pill-grouped links on
 * the right, brand mark on the left.
 *
 * `dark`-tone sections are: ink, teal, coral, rose. Everything else
 * is treated as a light surface (cream + base/light variants).
 */
const DARK_TONES = new Set(["ink", "teal", "coral", "rose"]);

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const [tone, setTone] = useState<string>("cream");
  const pathname = usePathname();

  /**
   * Smooth-scroll the Browse pill to the listings/filters section.
   * - On the home page we already have the section in the DOM, so we
   *   intercept the click and drive Lenis directly (`scrollTo`) for a
   *   smooth in-page slide.
   * - On any other route we let the link navigate normally to
   *   `/#hamsters`; PageTransition's onComplete then smooth-scrolls
   *   Lenis to the hash once the destination page is mounted.
   */
  const handleBrowseClick = (e: MouseEvent<HTMLAnchorElement>) => {
    trackEvent("nav_browse", {
      mode: pathname === "/" ? "in_page_scroll" : "navigate",
    });
    if (pathname !== "/") return;
    const target = document.querySelector(BROWSE_HASH);
    if (!target) return;
    e.preventDefault();
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(target as HTMLElement, {
        offset: SCROLL_OFFSET,
        duration: 1.1,
      });
    } else {
      // prefers-reduced-motion: Lenis is disabled, fall back to the
      // browser's smooth scroll which respects the OS setting.
      (target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Keep the URL in sync without triggering a full hash jump.
    if (window.location.hash !== BROWSE_HASH) {
      window.history.replaceState(null, "", `/${BROWSE_HASH}`);
    }
  };

  // Re-bind on every route change. The Header sits in the root layout
  // and never unmounts, but the page below it does — so the sections we
  // queried on first mount get torn down on navigation and the triggers
  // would be left pointing at stale, removed DOM nodes (which is why
  // the logo used to "stick" on the wrong colour after navigating from
  // /#hamsters back to a cream section). Watching `pathname` lets us
  // kill the old triggers and rebind to whatever the freshly-mounted
  // page actually rendered.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let triggers: ScrollTrigger[] = [];
    let cancelled = false;

    // Defer one frame so React has flushed the new page's DOM before
    // we query for `[data-tone]` — otherwise on a fast cross-route
    // navigation we'd still see the previous page's sections (or none
    // at all if they were unmounted before the new ones mounted).
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;

      // Reset to a neutral light tone first so pages without any
      // `[data-tone]` section (or that haven't ticked yet) don't keep
      // the previous route's tone — that was the visual "stickiness"
      // that left the wordmark inverted/white on a cream surface.
      setTone("cream");

      const sections =
        document.querySelectorAll<HTMLElement>("[data-tone]");
      sections.forEach((sec) => {
        const t = ScrollTrigger.create({
          trigger: sec,
          start: "top 64px",
          end: "bottom 64px",
          // `onToggle` doesn't fire on creation, so seed the active
          // section's tone synchronously below — this callback handles
          // every subsequent enter/leave as the user scrolls.
          onToggle: (self) => {
            if (self.isActive) setTone(sec.dataset.tone || "cream");
          },
        });
        triggers.push(t);

        // If this section is already under the header on mount (e.g.
        // landing on `/#hamsters` directly, or arriving via the page
        // transition mid-section), prime the tone now. Without this
        // the colour wouldn't update until the user scrolled.
        if (t.isActive) setTone(sec.dataset.tone || "cream");
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      triggers.forEach((t) => t.kill());
      triggers = [];
    };
  }, [pathname]);

  const dark = DARK_TONES.has(tone);
  const fg = dark ? "var(--cream)" : "var(--ink)";
  const hoverColor = dark ? "var(--mustard)" : "var(--coral)";
  // Pill background sits on top of the section colour so we always
  // need a translucent surface that reads regardless of section.
  const pillBg = dark
    ? "color-mix(in srgb, var(--ink) 70%, transparent)"
    : "color-mix(in srgb, var(--cream) 80%, transparent)";
  const pillBorder = dark
    ? "color-mix(in srgb, var(--cream) 18%, transparent)"
    : "color-mix(in srgb, var(--ink) 14%, transparent)";

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    gsap.to(el, { color: fg, duration: 0.4, ease: "power2.out" });
  }, [fg]);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-40"
      style={{
        color: fg,
        paddingTop: "clamp(0.75rem, 1.4vh, 1.25rem)",
        paddingBottom: "clamp(0.75rem, 1.4vh, 1.25rem)",
        paddingLeft: "var(--site-edge)",
        paddingRight: "var(--site-edge)",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4">
        {/* Brand wordmark — same SVG-masked mark as Hero/Footer so the
            nav glyph matches the rest of the site (not the raster PNG). */}
        <Link
          href="/"
          className="flex items-center"
          style={{ width: "clamp(6.5rem, 10vw, 8.5rem)" }}
          aria-label="Hamstr home"
          onClick={() => trackEvent("nav_home")}
        >
          <HamstrWordmark
            variant={dark ? "cream" : "ink"}
            ariaLabel="Hamstr"
            style={{
              transition: "background 320ms ease",
            }}
          />
        </Link>

        {/* Nav — Tesoro pill-grouped */}
        <nav
          className="hidden items-center gap-1 rounded-full border px-1.5 py-1 backdrop-blur-md sm:flex"
          style={{ background: pillBg, borderColor: pillBorder }}
        >
          {[
            { href: `/${BROWSE_HASH}`, label: "Browse", onClick: handleBrowseClick },
            {
              href: "/map",
              label: "View Map",
              onClick: () => trackEvent("nav_map"),
            },
          ].map((l) => (
            <span
              key={l.href + l.label}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider"
            >
              <StaggerHoverLink
                href={l.href}
                hoverColor={hoverColor}
                onClick={l.onClick}
              >
                {l.label}
              </StaggerHoverLink>
            </span>
          ))}
        </nav>

        {/* CTA — always visible, themed */}
        <Link
          href="/rehome"
          className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5"
          style={{
            background: dark ? "var(--mustard)" : "var(--ink)",
            color: dark ? "var(--ink)" : "var(--cream)",
          }}
          onClick={() => trackEvent("nav_rehome")}
        >
          Rehome
        </Link>
      </div>
    </header>
  );
}
