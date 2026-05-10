import {
  Gender,
  Hamster,
  Species,
  fetchHamsterCount,
  fetchHamsters,
  GENDERS,
  SPECIES,
} from "@/lib/api";
import { BrowseFilters } from "@/components/home/BrowseControls";
import { Hero } from "@/components/home/Hero";
import { FounderLetter } from "@/components/home/FounderLetter";
import { HamsterGrid } from "@/components/home/HamsterGrid";
import { HowItWorks } from "@/components/home/HowItWorks";

const PAGE_SIZE = 6;

type SearchParams = Record<string, string | string[] | undefined>;

function firstString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function parseFilters(params: SearchParams): {
  filters: BrowseFilters;
  apiFilters: {
    species?: Species;
    gender?: Gender;
    location?: string;
  };
  page: number;
} {
  const speciesRaw = firstString(params.species);
  const genderRaw = firstString(params.gender);
  const location = firstString(params.location);
  const pageRaw = Number(firstString(params.page));
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const species = SPECIES.some((s) => s.value === speciesRaw)
    ? (speciesRaw as Species)
    : "";
  const gender = GENDERS.some((g) => g.value === genderRaw)
    ? (genderRaw as Gender)
    : "";

  return {
    filters: {
      species,
      gender,
      location,
    },
    apiFilters: {
      species: species || undefined,
      gender: gender || undefined,
      location: location || undefined,
    },
    page,
  };
}

/**
 * Hamstr home — a Tesoro-style colour-block scroll: hero (cream),
 * founder letter (peach), hamster grid (teal), how-it-works (mustard),
 * and the falling-shapes footer (handled by the root layout).
 *
 * Filter and pagination state lives in the URL so links are shareable
 * and the page is fully server-rendered for fast first paint.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { filters, apiFilters, page } = parseFilters(params);
  const offset = (page - 1) * PAGE_SIZE;

  let hamsters: Hamster[] = [];
  let total = 0;
  let error: string | null = null;
  try {
    [hamsters, total] = await Promise.all([
      fetchHamsters({ ...apiFilters, limit: PAGE_SIZE, offset }),
      fetchHamsterCount(apiFilters),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load hamsters";
  }

  return (
    <>
      <Hero />
      <FounderLetter />
      <HamsterGrid
        hamsters={hamsters}
        error={error}
        filters={filters}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
      />
      <HowItWorks />
    </>
  );
}
