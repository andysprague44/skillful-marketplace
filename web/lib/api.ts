/**
 * Thin fetch wrapper around the Hamstr FastAPI backend.
 *
 * All functions throw on non-2xx responses so callers can surface errors
 * via standard try/catch or React error boundaries.
 */

export type Species =
  | "munchkin"
  | "dwarf_winter_white"
  | "dwarf_campbell"
  | "roborovski"
  | "chinese"
  | "other";

export const SPECIES: { value: Species; label: string }[] = [
  { value: "munchkin", label: "Munchkin" },
  { value: "dwarf_winter_white", label: "Winter White Dwarf" },
  { value: "dwarf_campbell", label: "Campbell Dwarf" },
  { value: "roborovski", label: "Roborovski" },
  { value: "chinese", label: "Chinese" },
  { value: "other", label: "Other" },
];

export type Gender = "female" | "male" | "unknown";

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unknown", label: "Unknown" },
];

export interface Hamster {
  id: number;
  name: string;
  species: Species;
  age_months: number;
  gender: Gender;
  color: string;
  temperament: string;
  story: string;
  includes: string;
  adoption_fee_cents: number;
  location: string;
  latitude: number | null;
  longitude: number | null;
  photo_url: string;
  current_human_name: string;
  current_human_email: string;
  created_at: string;
}

export interface HamsterCreate {
  name: string;
  species: Species;
  age_months: number;
  gender: Gender;
  color: string;
  temperament: string;
  story: string;
  includes: string;
  adoption_fee_cents: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  photo_url: string;
  current_human_name: string;
  current_human_email: string;
}

export interface HamsterFilters {
  q?: string;
  species?: Species;
  gender?: Gender;
  location?: string;
  max_fee_cents?: number;
  limit?: number;
  offset?: number;
}

function apiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
  return raw.replace(/\/+$/, "");
}

const API_BASE = apiBaseUrl();

/**
 * Build a query string from a plain object, dropping undefined/empty values.
 */
function toQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "number" && Number.isNaN(value)) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Fetch hamsters from the API, honoring the given filters. */
export async function fetchHamsters(
  filters: HamsterFilters = {},
  init?: RequestInit,
): Promise<Hamster[]> {
  const res = await fetch(`${API_BASE}/hamsters${toQuery({ ...filters })}`, {
    cache: "no-store",
    ...init,
  });
  return handle<Hamster[]>(res);
}

/** Filters accepted by the map endpoint (no text/location/pagination). */
export interface MapFilters {
  species?: Species;
  gender?: Gender;
  max_fee_cents?: number;
}

/**
 * Fetch hamsters that have coordinates, for the clustered map view.
 * The API caps this at 2000 rows, so 200 listings come back in one round trip.
 */
export async function fetchHamstersForMap(
  filters: MapFilters = {},
  init?: RequestInit,
): Promise<Hamster[]> {
  const res = await fetch(
    `${API_BASE}/hamsters/map${toQuery({ ...filters, limit: 500 })}`,
    { cache: "no-store", ...init },
  );
  return handle<Hamster[]>(res);
}

/** Fetch the total number of hamsters matching the given filters. */
export async function fetchHamsterCount(
  filters: Omit<HamsterFilters, "limit" | "offset"> = {},
  init?: RequestInit,
): Promise<number> {
  const res = await fetch(
    `${API_BASE}/hamsters/count${toQuery({ ...filters })}`,
    { cache: "no-store", ...init },
  );
  const body = await handle<{ total: number }>(res);
  return body.total;
}

/** Fetch a single hamster by id. */
export async function fetchHamster(
  id: number,
  init?: RequestInit,
): Promise<Hamster> {
  const res = await fetch(`${API_BASE}/hamsters/${id}`, {
    cache: "no-store",
    ...init,
  });
  return handle<Hamster>(res);
}

/** Create a new hamster listing. */
export async function createHamster(
  payload: HamsterCreate,
): Promise<Hamster> {
  const res = await fetch(`${API_BASE}/hamsters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<Hamster>(res);
}

/**
 * Format an adoption fee. Zero is shown as "Free to a good home" rather
 * than "$0", because the framing matters here.
 */
export function formatFee(cents: number): string {
  if (!cents) return "Free to a good home";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/**
 * Format an age in months as a human-readable phrase, e.g.
 * "4 months · pup", "1.5 years", "3 years · senior".
 */
export function formatAge(months: number): string {
  if (months <= 0) return "Newborn";
  if (months < 12) {
    const tag = months <= 4 ? " · pup" : "";
    return `${months} month${months === 1 ? "" : "s"}${tag}`;
  }
  const years = months / 12;
  const senior = months >= 24 ? " · senior" : "";
  const pretty = Number.isInteger(years) ? `${years}` : years.toFixed(1);
  return `${pretty} year${years === 1 ? "" : "s"}${senior}`;
}
