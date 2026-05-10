import { ReactNode } from "react";

type Tone = "cream" | "ink" | "teal" | "peach" | "mustard" | "pink" | "coral" | "rose";

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  cream: { bg: "var(--cream)", fg: "var(--ink)" },
  ink: { bg: "var(--ink)", fg: "var(--cream)" },
  teal: { bg: "var(--teal)", fg: "var(--cream)" },
  peach: { bg: "var(--peach)", fg: "var(--ink)" },
  mustard: { bg: "var(--mustard)", fg: "var(--ink)" },
  pink: { bg: "var(--pink)", fg: "var(--ink)" },
  coral: { bg: "var(--coral)", fg: "var(--cream)" },
  rose: { bg: "var(--rose)", fg: "var(--cream)" },
};

/**
 * A pill-shaped chip with a soft drop shadow that looks like a sticker
 * peeled and dropped onto the page. Floats over imagery in the hero
 * and section headers.
 */
export function Sticker({
  children,
  tone = "cream",
  rotate = 0,
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  rotate?: number;
  className?: string;
}) {
  const { bg, fg } = toneStyles[tone];
  return (
    <span
      className={`sticker-shadow inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${className}`}
      style={{
        background: bg,
        color: fg,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children}
    </span>
  );
}
