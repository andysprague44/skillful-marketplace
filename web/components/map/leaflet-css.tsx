"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

/**
 * Side-effect-only module that imports Leaflet's stylesheets.
 *
 * Imported by every map-using component so the styles are bundled exactly
 * once into the client chunk. Renders nothing.
 */
export function LeafletCSS() {
  return null;
}
