import { Hamster, fetchHamstersForMap } from "@/lib/api";
import { MapShell } from "./MapShell";

/**
 * Full-page clustered map of every hamster with coordinates.
 *
 * Data is fetched server-side so the initial HTML carries the JSON
 * payload; the client component then hydrates Leaflet and renders the
 * pins. Pins cluster automatically and split into individual markers
 * as you zoom in.
 */
export const dynamic = "force-dynamic";

export default async function MapPage() {
  let hamsters: Hamster[] = [];
  let error: string | null = null;
  try {
    hamsters = await fetchHamstersForMap();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load map data";
  }

  return <MapShell hamsters={hamsters} error={error} />;
}
