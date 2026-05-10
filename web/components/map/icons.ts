import L from "leaflet";

/**
 * Shared Leaflet icon helpers for the Hamstr map.
 *
 * Both icons are SVG so that:
 *   - the cream stroke survives at any size (CSS clip-path would clip it),
 *   - the silhouette is one unified path (no seam between head and stem),
 *   - drop-shadows and inner accents render at retina sharpness.
 *
 * Brand colours are inlined (rather than read via getComputedStyle) so the
 * markup is stable between SSR-style snapshotting and the first client paint.
 */

const TEAL = "#1f6e6a";
const CREAM = "#fbf6ee";
const TEAL_DARK = "#103432";

/** Pin: squircle head with a sharp tip. Anchored at the tip. */
export function hamsterPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "hamstr-pin-wrap",
    html: pinSvg(),
    iconSize: [32, 44],
    iconAnchor: [16, 42],
    popupAnchor: [0, -36],
  });
}

/** Cluster badge: squircle with cream border + count in the display font. */
export function hamsterClusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? 40 : count < 100 ? 48 : 60;
  return L.divIcon({
    className: "hamstr-cluster",
    html: clusterSvg(count, size),
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function pinSvg(): string {
  // Squircle head (30×30 box from (1,1) to (31,31), rounded with r=8)
  // joined directly to a sharp tip at (16, 42). The bottom-right and
  // bottom-left corner arcs of the squircle flow into straight diagonals
  // that meet at the tip — no break in the silhouette, no double stroke.
  const path =
    "M 9 1 H 23 A 8 8 0 0 1 31 9 V 23 A 8 8 0 0 1 23 31 " +
    "L 16 42 L 9 31 A 8 8 0 0 1 1 23 V 9 A 8 8 0 0 1 9 1 Z";
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44" aria-hidden="true">
  <defs>
    <filter id="hp-shadow" x="-50%" y="-30%" width="200%" height="170%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="${TEAL_DARK}" flood-opacity="0.42"/>
    </filter>
  </defs>
  <g filter="url(#hp-shadow)">
    <path
      d="${path}"
      fill="${TEAL}"
      stroke="${CREAM}"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <circle cx="16" cy="16" r="3" fill="${CREAM}"/>
  </g>
</svg>`.trim();
}

function clusterSvg(count: number, size: number): string {
  // Squircle in a 100×100 viewBox: rounded rect inset by 3 on every
  // side so the cream stroke clears the SVG bounds, with rx/ry = 26
  // (~28% of the 94-px inner edge — squircle territory).
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
  <defs>
    <filter id="hc-shadow-${size}" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${TEAL_DARK}" flood-opacity="0.40"/>
    </filter>
  </defs>
  <g filter="url(#hc-shadow-${size})">
    <rect x="3" y="3" width="94" height="94" rx="26" ry="26" fill="${TEAL}" stroke="${CREAM}" stroke-width="5" stroke-linejoin="round"/>
  </g>
  <text
    x="50"
    y="50"
    text-anchor="middle"
    dominant-baseline="central"
    fill="${CREAM}"
    font-family="var(--font-display), Georgia, serif"
    font-weight="800"
    font-size="${count < 100 ? 38 : 30}"
    letter-spacing="-2"
  >${count}</text>
</svg>`.trim();
}
