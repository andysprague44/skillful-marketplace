import { CSSProperties, ReactNode } from "react";

type Tone =
  | "cream"
  | "ink"
  | "teal"
  | "peach"
  | "mustard"
  | "pink"
  | "coral"
  | "rose"
  | "white";

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  cream: { bg: "var(--cream)", fg: "var(--ink)" },
  ink: { bg: "var(--ink)", fg: "var(--cream)" },
  teal: { bg: "var(--teal)", fg: "var(--cream)" },
  peach: { bg: "var(--peach)", fg: "var(--ink)" },
  mustard: { bg: "var(--mustard)", fg: "var(--ink)" },
  pink: { bg: "var(--pink)", fg: "var(--ink)" },
  coral: { bg: "var(--coral)", fg: "var(--cream)" },
  rose: { bg: "var(--rose)", fg: "var(--cream)" },
  white: { bg: "var(--surface)", fg: "var(--ink)" },
};

/**
 * Full-bleed colored section. Sets `--section-bg` / `--section-fg` so
 * descendants (and the header listening via ScrollTrigger) can pick the
 * right tint.
 *
 * Pass `dataTone` so ScrollTrigger can match the in-view section to a
 * theme without re-reading colors from the DOM.
 */
export function SectionBlock({
  tone,
  children,
  className = "",
  innerClassName = "",
  style,
  id,
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const { bg, fg } = toneStyles[tone];
  return (
    <section
      id={id}
      data-tone={tone}
      className={`relative w-full ${className}`}
      style={
        {
          background: bg,
          color: fg,
          ["--section-bg" as string]: bg,
          ["--section-fg" as string]: fg,
          ...style,
        } as CSSProperties
      }
    >
      <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${innerClassName}`}>
        {children}
      </div>
    </section>
  );
}
