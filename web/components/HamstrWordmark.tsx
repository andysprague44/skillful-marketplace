import type { CSSProperties } from "react";

/**
 * Hamstr wordmark, painted through the cropped SVG letterforms via
 * CSS `mask-image`. Three colour variants:
 *
 * - `ink`      → solid ink (default).
 * - `cream`    → solid cream (use on dark sections).
 * - `gradient` → the brand warm-flow gradient drifts through the letters,
 *   matching the existing `.gradient-flow` text effect.
 *
 * The element fills its parent's width and locks to the cropped
 * viewBox aspect (≈4.764:1) so it never letterboxes. Consumers can
 * override `width` / `aspectRatio` via the `style` prop if needed.
 *
 * Native viewBox of `/hamstr-wordmark.svg` (cropped to glyph bbox):
 *   `231.33 405.61 119.25 26.61`  →  aspect 119.25 / 26.61.
 */
const ASPECT = "119.25 / 26.61";

const maskBase: CSSProperties = {
  display: "block",
  width: "100%",
  aspectRatio: ASPECT,
  // Both prefixed and unprefixed for Safari (≤ 18) and modern browsers.
  WebkitMaskImage: "url(/hamstr-wordmark.svg)",
  maskImage: "url(/hamstr-wordmark.svg)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  // Belt-and-suspenders: the served SVG has a white fill so luminance
  // masking already works everywhere, and we also pin alpha mode for
  // any browser that prefers it (modern Safari & Chromium support
  // `mask-mode` unprefixed).
  maskMode: "alpha",
};

type Variant = "ink" | "cream" | "gradient";

export function HamstrWordmark({
  variant = "ink",
  className = "",
  style,
  ariaLabel = "hamstr",
}: {
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  if (variant === "gradient") {
    return (
      <div
        role="img"
        aria-label={ariaLabel}
        className={`gradient-flow-paint ${className}`.trim()}
        style={{ ...maskBase, ...style }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={{
        ...maskBase,
        background: variant === "cream" ? "var(--cream)" : "var(--ink)",
        ...style,
      }}
    />
  );
}
