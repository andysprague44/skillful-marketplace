import type { ConnectedPillTone } from "@/components/ui/ConnectedPills";

/**
 * Shared palette vocabulary for hamster-tinted surfaces.
 *
 * Each palette is a deep-on-pale combo from the Hamstr design system:
 *   bg     — pale section/card background
 *   fg     — deep text colour that reads on `bg`
 *   accent — a saturated colour from the same family (used for squircles, chips)
 *   chip   / chipFg — high-contrast pill used for prices/CTAs on the surface
 *   pills  — a two-tone pair for the <ConnectedPills> eyebrow so it
 *            always reads against this palette's `bg`
 *
 * Used by the hamster grid card and the hamster detail page so that a
 * hamster keeps the same visual identity whether you're browsing or
 * reading their full listing.
 *
 * `--teal-base` is intentionally excluded because the grid section
 * itself uses --teal-base as its background; a card sharing that tone
 * visually disappears into the page.
 */
export interface HamsterPalette {
  bg: string;
  fg: string;
  accent: string;
  /** Text colour that reads cleanly on `accent`. */
  accentFg: string;
  chip: string;
  chipFg: string;
  pills: [ConnectedPillTone, ConnectedPillTone];
  /** `data-tone` label so the scroll-driven header retint can pick
   *  a legible link colour against this palette's `bg`. All hamster
   *  palettes are light surfaces, so this is always a "light" tone. */
  tone: string;
}

export const HAMSTER_PALETTES: HamsterPalette[] = [
  {
    bg: "var(--peach-base)",
    fg: "var(--coral-dark)",
    accent: "var(--coral)",
    accentFg: "var(--cream)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["coral", "peach"],
    tone: "peach-base",
  },
  {
    bg: "var(--mustard-base)",
    fg: "var(--mustard-dark)",
    accent: "var(--mustard)",
    accentFg: "var(--mustard-dark)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["ink", "mustard"],
    tone: "mustard-base",
  },
  {
    bg: "var(--pink-base)",
    fg: "var(--rose-dark)",
    accent: "var(--rose)",
    accentFg: "var(--cream)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["rose", "pink"],
    tone: "pink-base",
  },
  {
    bg: "var(--cream-deep)",
    fg: "var(--ink)",
    accent: "var(--coral)",
    accentFg: "var(--cream)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["ink", "coral"],
    tone: "cream-deep",
  },
  {
    bg: "var(--sage-base)",
    fg: "var(--sage-dark)",
    accent: "var(--sage)",
    accentFg: "var(--cream)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["sage", "sage-light"],
    tone: "sage-base",
  },
  {
    bg: "var(--chartreuse-base)",
    fg: "var(--chartreuse-dark)",
    accent: "var(--chartreuse)",
    accentFg: "var(--chartreuse-dark)",
    chip: "var(--ink)",
    chipFg: "var(--cream)",
    pills: ["ink", "chartreuse"],
    tone: "chartreuse-base",
  },
];

/** Stable palette lookup keyed on hamster id. */
export function paletteFor(id: number): HamsterPalette {
  return HAMSTER_PALETTES[id % HAMSTER_PALETTES.length];
}
