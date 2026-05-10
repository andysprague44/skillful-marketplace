"use client";

import Link from "next/link";
import { Hamster, SPECIES, formatAge, formatFee } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { paletteFor } from "@/lib/palettes";
import { Squircle } from "@/components/ui/Squircle";

/**
 * Hamster preview card — Tesoro pattern: each card is a fully tinted
 * coloured block (bg + matching dark text), with a squircle photo on
 * a darker accent of the same family. The card carries the colour;
 * the photo carries the personality.
 */
export function HamsterCard({ hamster }: { hamster: Hamster }) {
  const speciesLabel =
    SPECIES.find((s) => s.value === hamster.species)?.label ?? hamster.species;
  const palette = paletteFor(hamster.id);

  return (
    <Link
      href={`/hamsters/${hamster.id}`}
      onClick={() =>
        trackEvent("listing_click", {
          hamster_id: hamster.id,
          surface: "browse_grid",
        })
      }
      className="group relative flex h-full flex-col gap-5 rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <div className="flex justify-center">
        <Squircle
          className="aspect-square w-full max-w-[280px]"
          style={{ background: palette.accent }}
        >
          {hamster.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={hamster.photo_url}
              alt={hamster.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center transition-transform duration-700 group-hover:scale-110"
              style={{ fontSize: "clamp(72px, 10vw, 120px)", lineHeight: 1 }}
            >
              🐹
            </div>
          )}
        </Squircle>
      </div>

      <div className="flex flex-col gap-1">
        {/*
          Title is locked to a single line with ellipsis. The fixed
          ``minHeight`` keeps the title block exactly one line tall
          even on cards where the name happens to be very short — so
          every card has the same intrinsic height regardless of
          content. Two-word names like "Captain Whiskers" are common
          enough that we don't want them shoving the footer down on
          some cards but not others.
        */}
        <h3
          className="font-display overflow-hidden"
          style={{
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1,
            fontSize: "clamp(1.75rem, 2.4vw, 2.25rem)",
            color: palette.fg,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            minHeight: "1lh",
          }}
        >
          {hamster.name}
        </h3>
        {/*
          Species · age · colour can be short ("Munchkin · 6 months ·
          Dove") or long enough to wrap two lines ("Roborovski · 6
          months · Sandy with a white belly"). Lock to two lines and
          reserve the matching vertical space so the card height is
          stable across pages — otherwise the pagination row jumps
          when the user clicks Next/Prev.
        */}
        <p
          className="text-xs font-semibold uppercase tracking-wider overflow-hidden"
          style={{
            color: palette.fg,
            opacity: 0.7,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2lh",
          }}
        >
          {[speciesLabel, formatAge(hamster.age_months), hamster.color]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div
        className="mt-auto flex items-center justify-between gap-3 pt-3"
        style={{ borderTop: `1px solid color-mix(in srgb, ${palette.fg} 15%, transparent)` }}
      >
        {/*
          Location can be "Halifax, NS" or "San Francisco, CA" —
          single-line truncate with min-w-0 + flex-1 so the chip on
          the right keeps a fixed slot and doesn't dance around when
          the city name is long.
        */}
        <span
          className="min-w-0 flex-1 truncate text-xs font-semibold"
          style={{ color: palette.fg, opacity: 0.75 }}
        >
          {hamster.location ? `📍 ${hamster.location}` : "📍 nearby"}
        </span>
        <span
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide"
          style={{ background: palette.chip, color: palette.chipFg }}
        >
          {formatFee(hamster.adoption_fee_cents).toUpperCase()}
        </span>
      </div>
    </Link>
  );
}
