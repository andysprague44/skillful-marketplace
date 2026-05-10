export type ConnectedPillTone =
  | "cream"
  | "ink"
  | "teal"
  | "teal-base"
  | "teal-light"
  | "peach"
  | "peach-base"
  | "mustard"
  | "mustard-base"
  | "pink"
  | "pink-base"
  | "coral"
  | "rose"
  | "sage"
  | "sage-light"
  | "chartreuse"
  | "chartreuse-light";

const tones: Record<ConnectedPillTone, { bg: string; fg: string }> = {
  cream: { bg: "var(--cream)", fg: "var(--ink)" },
  ink: { bg: "var(--ink)", fg: "var(--cream)" },
  teal: { bg: "var(--teal)", fg: "var(--cream)" },
  "teal-base": { bg: "var(--teal-base)", fg: "var(--teal-dark)" },
  "teal-light": { bg: "var(--teal-light)", fg: "var(--teal-dark)" },
  peach: { bg: "var(--peach)", fg: "var(--coral-dark)" },
  "peach-base": { bg: "var(--peach-base)", fg: "var(--coral-dark)" },
  mustard: { bg: "var(--mustard)", fg: "var(--mustard-dark)" },
  "mustard-base": { bg: "var(--mustard-base)", fg: "var(--mustard-dark)" },
  pink: { bg: "var(--pink)", fg: "var(--rose-dark)" },
  "pink-base": { bg: "var(--pink-base)", fg: "var(--rose-dark)" },
  coral: { bg: "var(--coral)", fg: "var(--cream)" },
  rose: { bg: "var(--rose)", fg: "var(--cream)" },
  sage: { bg: "var(--sage)", fg: "var(--cream)" },
  "sage-light": { bg: "var(--sage-light)", fg: "var(--sage-dark)" },
  chartreuse: { bg: "var(--chartreuse)", fg: "var(--chartreuse-dark)" },
  "chartreuse-light": {
    bg: "var(--chartreuse-light)",
    fg: "var(--chartreuse-dark)",
  },
};

/**
 * Tesoro-style "connecting pills" label — two short text capsules sitting
 * next to each other, slightly overlapping, used as a centered eyebrow
 * above big display headings. e.g. ["FOR THE", "MERCHANT"].
 */
export function ConnectedPills({
  parts,
  tones: pillTones,
  className = "",
}: {
  parts: [string, string];
  tones: [ConnectedPillTone, ConnectedPillTone];
  className?: string;
}) {
  const a = tones[pillTones[0]];
  const b = tones[pillTones[1]];

  return (
    <span className={`connected-pills ${className}`}>
      <span
        className="cp-pill"
        style={{ background: a.bg, color: a.fg, position: "relative", zIndex: 2 }}
      >
        {parts[0]}
      </span>
      <span
        className="cp-pill"
        style={{ background: b.bg, color: b.fg, position: "relative", zIndex: 1 }}
      >
        {parts[1]}
      </span>
    </span>
  );
}
