"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { Hamster, SPECIES, formatAge, formatFee } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { LeafletCSS } from "./leaflet-css";
import { hamsterClusterIcon, hamsterPinIcon } from "./icons";

/**
 * Full-page clustered map of every hamster that has coordinates.
 *
 * Uses Leaflet directly (rather than react-leaflet wrappers) so we can
 * keep the leaflet.markercluster integration tiny and avoid the extra
 * abstraction; the cluster plugin doesn't have first-class react-leaflet
 * bindings in the v5 line.
 *
 * The component is purely client-side — it touches ``window`` and the
 * DOM at module load — so the parent route imports it via
 * ``next/dynamic`` with ``ssr: false``.
 */
export function HamsterMap({ hamsters }: { hamsters: Hamster[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Stable reference to the rows so the marker effect doesn't churn.
  const points = useMemo(
    () =>
      hamsters.filter(
        (h): h is Hamster & { latitude: number; longitude: number } =>
          typeof h.latitude === "number" && typeof h.longitude === "number",
      ),
    [hamsters],
  );

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    if (mapRef.current) return; // dev-mode StrictMode double-invoke guard

    const map = L.map(node, {
      center: [42.5, -94],
      zoom: 4,
      worldCopyJump: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    // CARTO Voyager: soft, muted basemap that lets the brand teal pins pop
    // without going fully grayscale.
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attribution">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    ).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.(
        "a.hamstr-popup-link",
      ) as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.dataset.hamsterId;
      if (id) trackEvent("map_listing_click", { hamster_id: Number(id) });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (points.length === 0) return;

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 60,
      iconCreateFunction: (group) => hamsterClusterIcon(group.getChildCount()),
    });

    for (const h of points) {
      const marker = L.marker([h.latitude, h.longitude], {
        icon: hamsterPinIcon(),
        title: h.name,
        riseOnHover: true,
      });
      marker.bindPopup(buildPopup(h), {
        maxWidth: 280,
        minWidth: 280,
        className: "hamstr-popup",
        closeButton: false,
        autoPanPadding: [24, 24],
      });
      cluster.addLayer(marker);
    }
    map.addLayer(cluster);

    // Fit to all points the first time we load them.
    const bounds = cluster.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    }

    return () => {
      map.removeLayer(cluster);
    };
  }, [points]);

  return (
    <>
      <LeafletCSS />
      <div ref={containerRef} className="h-full w-full" />
    </>
  );
}

function buildPopup(h: Hamster & { latitude: number; longitude: number }): string {
  const speciesLabel =
    SPECIES.find((s) => s.value === h.species)?.label ?? h.species;
  const isFree = h.adoption_fee_cents === 0;
  const fee = isFree ? "Free to a good home" : formatFee(h.adoption_fee_cents);
  const age = formatAge(h.age_months);
  const eyebrow = `${speciesLabel} · ${h.gender}`;
  const photo = h.photo_url
    ? `<img src="${escapeAttr(h.photo_url)}" alt="" class="hamstr-popup-photo" loading="lazy" />`
    : '<div class="hamstr-popup-photo hamstr-popup-photo--empty" aria-hidden="true">🐹</div>';
  const chipClass = isFree
    ? "hamstr-popup-fee hamstr-popup-fee--free"
    : "hamstr-popup-fee";
  return `
    <a class="hamstr-popup-link" data-hamster-id="${h.id}" href="/hamsters/${h.id}">
      <div class="hamstr-popup-photo-wrap">${photo}</div>
      <div class="hamstr-popup-body">
        <p class="hamstr-popup-eyebrow">${escapeText(eyebrow)}</p>
        <h3 class="hamstr-popup-name">${escapeText(h.name)}<span aria-hidden="true">.</span></h3>
        <p class="hamstr-popup-meta">${escapeText(age)} &middot; ${escapeText(h.location)}</p>
        <div class="hamstr-popup-footer">
          <span class="${chipClass}">${escapeText(fee)}</span>
          <span class="hamstr-popup-view">View <span aria-hidden="true">→</span></span>
        </div>
      </div>
    </a>
  `;
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}
