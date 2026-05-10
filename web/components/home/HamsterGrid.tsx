"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { Hamster } from "@/lib/api";
import { HamsterCard } from "@/components/HamsterCard";
import { BrowseControls, BrowseFilters } from "@/components/home/BrowseControls";
import { Pagination } from "@/components/home/Pagination";
import { RevealChars } from "@/components/motion/RevealChars";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// useLayoutEffect would emit React's "doesn't do anything on the
// server" warning during SSR. Aliasing to useEffect on the server
// silences it without changing client behaviour.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Section C — listing grid. Tesoro pattern: pale teal section background,
 * connected pills + center heading, then a 3-up grid of saturated cards.
 * Each card carries its own colour family so the grid reads like a
 * confetti of stickers.
 *
 * Two distinct animation modes:
 *
 *   1. **First reveal** — the very first time the grid scrolls into view
 *      we play a one-shot stagger-up reveal (cards rise from below with
 *      a soft expo ease).
 *   2. **Page / filter swap** — every time ``page`` or ``filters`` change
 *      the cards slide in horizontally from the right with a staggered
 *      entrance. This is the "carousel-y" feel that pagination should
 *      have: the rest of the page stays still and only the grid swaps.
 *      For "Prev" we slide in from the left so the direction matches
 *      the user's intent.
 */
export function HamsterGrid({
  hamsters,
  error,
  filters,
  total,
  page,
  pageSize,
}: {
  hamsters: Hamster[];
  error: string | null;
  filters: BrowseFilters;
  total: number;
  page: number;
  pageSize: number;
}) {
  const gridRef = useRef<HTMLUListElement>(null);
  // Tracks whether the first reveal has already happened. After that,
  // every prop change is treated as a "swap" rather than a "reveal".
  const hasRevealedRef = useRef(false);
  const prevPageRef = useRef(page);
  // Cheap stable signature of the active filters — when this changes
  // we know it's a filter swap (treat as "forward" slide).
  const filterKey = `${filters.species}|${filters.gender}|${filters.location}`;
  const prevFilterKeyRef = useRef(filterKey);

  // First-paint reveal: scrubbed by ScrollTrigger so the cards don't
  // pop in until the section is on screen. Runs exactly once.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      hasRevealedRef.current = true;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;
    if (hasRevealedRef.current) return;

    const cards = grid.querySelectorAll<HTMLElement>("li");
    const ctx = gsap.context(() => {
      gsap.set(cards, { y: 60, opacity: 0 });
      ScrollTrigger.create({
        trigger: grid,
        start: "top 78%",
        once: true,
        onEnter: () => {
          hasRevealedRef.current = true;
          gsap.to(cards, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.08,
          });
        },
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  // Page / filter swap: slide the new cards in horizontally. Skipped
  // until the first reveal has fired so we don't fight the initial
  // stagger-up on first paint. Layout effect so the "from" state is
  // committed before the browser paints — otherwise the new cards
  // briefly flash in their final position before the slide begins.
  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prevPageRef.current = page;
      prevFilterKeyRef.current = filterKey;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;

    const pageChanged = page !== prevPageRef.current;
    const filtersChanged = filterKey !== prevFilterKeyRef.current;
    const goingBack = pageChanged && page < prevPageRef.current;

    prevPageRef.current = page;
    prevFilterKeyRef.current = filterKey;

    if (!hasRevealedRef.current) return;
    if (!pageChanged && !filtersChanged) return;

    const cards = grid.querySelectorAll<HTMLElement>("li");
    if (cards.length === 0) return;

    const fromX = goingBack ? -56 : 56;
    gsap.fromTo(
      cards,
      { x: fromX, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.55,
        ease: "expo.out",
        stagger: 0.045,
        overwrite: "auto",
      },
    );
  }, [page, filterKey, hamsters]);

  return (
    <section
      id="hamsters"
      data-tone="teal-base"
      className="relative w-full"
      style={{
        background: "var(--teal-base)",
        color: "var(--teal-dark)",
      }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center"
        style={{
          maxWidth: 1440,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(5rem, 11vh, 9rem)",
          paddingBottom: "clamp(5rem, 11vh, 9rem)",
          gap: "clamp(2.5rem, 5vh, 4rem)",
        }}
      >
        <h2
          className="display-lg mx-auto text-center"
          style={{ maxWidth: "18ch", color: "var(--teal-dark)" }}
        >
          <RevealChars as="span">find a hamster </RevealChars>
          <RevealChars as="span" delay={0.1} className="text-[color:var(--teal)]">
            near you.
          </RevealChars>
        </h2>

        <BrowseControls filters={filters} total={total} />

        {error ? (
          <div
            className="mx-auto max-w-2xl rounded-2xl p-6 text-center text-sm"
            style={{
              background: "color-mix(in srgb, var(--rose) 25%, transparent)",
              color: "var(--teal-dark)",
            }}
          >
            {error}. Make sure the API is running on port 8000.
          </div>
        ) : hamsters.length === 0 ? (
          <div
            className="mx-auto max-w-2xl rounded-3xl p-10 text-center"
            style={{ background: "color-mix(in srgb, var(--teal) 12%, transparent)" }}
          >
            <p className="body-main">
              Be the first to post.{" "}
              <Link
                href="/rehome"
                className="underline decoration-2 underline-offset-4"
                style={{ color: "var(--teal)" }}
              >
                Rehome a hamster
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <ul
              ref={gridRef}
              className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {hamsters.map((h) => (
                <li key={h.id}>
                  <HamsterCard hamster={h} />
                </li>
              ))}
            </ul>
            <Pagination
              filters={filters}
              total={total}
              page={page}
              pageSize={pageSize}
            />
          </>
        )}
      </div>
    </section>
  );
}
