import { CSSProperties, ReactNode } from "react";

/**
 * A squircle (soft rounded-square) frame. Uses ``border-radius`` rather
 * than ``clip-path`` so the shape stays responsive to any container size
 * and produces clean anti-aliased edges. Pass any background — image,
 * colour, video. Children are positioned over the clipped area.
 */
export function Squircle({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`clip-squircle ${className}`} style={style}>
      {children}
    </div>
  );
}
