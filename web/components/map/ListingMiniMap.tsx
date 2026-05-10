"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { LeafletCSS } from "./leaflet-css";
import { hamsterPinIcon } from "./icons";

/**
 * Compact, non-interactive map for the listing detail page.
 *
 * Shows a single pin centered at the hamster's coordinates with a
 * fixed mid-level zoom. Drag/zoom are disabled so the map doesn't
 * fight with page scrolling on mobile.
 */
export function ListingMiniMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (mapRef.current) return;

    const map = L.map(node, {
      center: [latitude, longitude],
      zoom: 12,
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: hamsterPinIcon(),
    }).addTo(map);
    if (label) marker.bindTooltip(label, { permanent: false, direction: "top" });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, label]);

  return (
    <>
      <LeafletCSS />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}
