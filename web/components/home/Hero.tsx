"use client";

import { PillCTA } from "@/components/ui/PillCTA";
import { RevealChars } from "@/components/motion/RevealChars";
import { RevealUp } from "@/components/motion/RevealUp";
import { CursorHamster } from "@/components/CursorHamster";
import { HamstrWordmark } from "@/components/HamstrWordmark";
import { trackEvent } from "@/lib/analytics";

/**
 * Hero — Tesoro pattern: center-aligned, small intro stack at top, HUGE
 * brand wordmark at the bottom of the viewport. Cream background,
 * teal accents. No floating stickers (those caused overlap chaos).
 *
 * Layout: [intro headline] → [supporting copy] → [pill CTAs] →
 * [HUGE "hamstr" mark]
 */
export function Hero() {
  return (
    <section
      data-tone="cream"
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      {/* Cursor hamster scoped to hero */}
      <CursorHamster containerSelector="#hero" />

      <div
        className="relative mx-auto flex w-full flex-col items-center text-center"
        style={{
          maxWidth: 1440,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(10rem, 20vh, 17rem)",
          paddingBottom: "clamp(2rem, 6vh, 5rem)",
          gap: "clamp(1.5rem, 3vh, 2.75rem)",
        }}
      >
        {/* The headline — big but not the wordmark; Tesoro keeps the
            brand mark itself as the showstopper. */}
        <h1
          className="display-xl mx-auto"
          style={{ maxWidth: "16ch", color: "var(--ink)" }}
        >
          <RevealChars as="span">soft landings for </RevealChars>
          <RevealChars as="span" delay={0.1} className="text-[color:var(--teal)]">
            small lives.
          </RevealChars>
        </h1>

        <RevealUp delay={0.4}>
          <p className="body-lead mx-auto max-w-[52ch] text-[color:var(--ink-soft)]">
            A gentle marketplace for rehoming hamsters with care. Every
            listing comes with a story, a photo, and the kind of details
            that help small humans match with the right small life.
          </p>
        </RevealUp>

        <RevealUp delay={0.55} className="flex flex-wrap items-center justify-center gap-3">
          <PillCTA
            href="/#hamsters"
            onClick={() => trackEvent("hero_cta_meet_hamsters")}
          >
            meet the hamsters
          </PillCTA>
          <PillCTA
            href="/rehome"
            variant="cream"
            onClick={() => trackEvent("hero_cta_rehome")}
          >
            rehome yours
          </PillCTA>
        </RevealUp>
      </div>

      {/* The HUGE wordmark — full-bleed across the bottom. Tesoro
          signature: brand wordmark scales with viewport so it dominates
          the hero edge-to-edge. The cropped SVG letterforms are masked
          and the brand warm-flow gradient drifts through them for a
          living, breathing feel.

          The next section (FounderLetter / peach) is pulled up with a
          negative margin to cover the bottom 15% of this wordmark. */}
      <HamstrWordmark
        variant="gradient"
        style={{
          // Aspect-locked SVG fills the full section width so the
          // wordmark scales with the viewport just like the old
          // text-rendered version (clamp(5rem, 24vw, 22rem) ≈ this).
          width: "100%",
          // Calmer, more hypnotic sweep — doesn't compete with the
          // hero copy for attention.
          ["--gradient-flow-duration" as string]: "24s",
        }}
      />
    </section>
  );
}
