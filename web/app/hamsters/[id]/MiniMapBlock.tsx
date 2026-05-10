"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper that lazy-loads the listing's mini map without
 * SSR (Leaflet touches ``window`` at module scope). The detail page
 * stays a server component; only this small block hydrates.
 */
const ListingMiniMap = dynamic(
  () =>
    import("@/components/map/ListingMiniMap").then((m) => m.ListingMiniMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center text-xs font-bold uppercase tracking-wider"
        style={{ opacity: 0.6 }}
      >
        loading map…
      </div>
    ),
  },
);

export function MiniMapBlock({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  return <ListingMiniMap latitude={latitude} longitude={longitude} label={label} />;
}
