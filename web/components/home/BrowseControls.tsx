"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { GENDERS, Gender, SPECIES, Species } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

export interface BrowseFilters {
  species: Species | "";
  gender: Gender | "";
  location: string;
}

/**
 * Filter panel for the browse grid.
 *
 * Three filters: location, gender, breed. Submits to ``/`` with URL
 * search params so the home page can re-render server-side and
 * pagination links share the same state. Keeps the Tesoro colour-block
 * aesthetic by sitting on a translucent teal card.
 */
export function BrowseControls({
  filters,
  total,
}: {
  filters: BrowseFilters;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<BrowseFilters>(filters);

  function update<K extends keyof BrowseFilters>(
    key: K,
    value: BrowseFilters[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackEvent("filter_apply", {
      species: values.species || undefined,
      gender: values.gender || undefined,
      has_location: Boolean(values.location.trim()),
    });
    const params = new URLSearchParams();
    if (values.species) params.set("species", values.species);
    if (values.gender) params.set("gender", values.gender);
    if (values.location.trim()) params.set("location", values.location.trim());
    const qs = params.toString();
    // ``scroll: false`` keeps the user anchored on the filter panel and
    // lets the grid component play its own slide-in animation when the
    // new results stream in. Without it, Next.js would jump-scroll to
    // the ``#hamsters`` anchor, which clashes with the in-place swap
    // and feels like a full-page reload.
    router.push(qs ? `/?${qs}#hamsters` : "/#hamsters", { scroll: false });
  }

  function onReset() {
    trackEvent("filter_clear");
    setValues({ species: "", gender: "", location: "" });
    router.push("/#hamsters", { scroll: false });
  }

  const hasFilters = Boolean(searchParams.toString());

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-3xl p-5 sm:p-6"
      style={{
        background: "color-mix(in srgb, var(--teal) 10%, transparent)",
        color: "var(--teal-dark)",
      }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Location">
          <input
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Toronto, ON"
            className={inputClass}
          />
        </Field>
        <Field label="Gender">
          <select
            value={values.gender}
            onChange={(e) => update("gender", e.target.value as Gender | "")}
            className={inputClass}
          >
            <option value="">Any</option>
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-70">
          Breed
        </p>
        <div className="flex flex-wrap gap-2">
          <SpeciesChip
            label="Any"
            active={values.species === ""}
            onClick={() => update("species", "")}
          />
          {SPECIES.map((s) => (
            <SpeciesChip
              key={s.value}
              label={s.label}
              active={values.species === s.value}
              onClick={() => update("species", s.value)}
            />
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
          {total === 1 ? "1 match" : `${total} matches`}
        </p>
        <div className="flex gap-2">
          {hasFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-full px-4 py-2 text-xs font-bold tracking-wide"
              style={{
                background: "transparent",
                color: "var(--teal-dark)",
                border: "1px solid color-mix(in srgb, var(--teal-dark) 25%, transparent)",
              }}
            >
              CLEAR
            </button>
          ) : null}
          <button
            type="submit"
            className="rounded-full px-5 py-2 text-xs font-bold tracking-wide text-white"
            style={{ background: "var(--teal-dark)" }}
          >
            APPLY FILTERS
          </button>
        </div>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border bg-white/70 px-3 py-2 text-base outline-none focus:bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
        {label}
      </span>
      {children}
    </label>
  );
}

function SpeciesChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide transition"
      style={
        active
          ? { background: "var(--teal-dark)", color: "white" }
          : {
              background: "transparent",
              color: "var(--teal-dark)",
              border:
                "1px solid color-mix(in srgb, var(--teal-dark) 25%, transparent)",
            }
      }
    >
      {label.toUpperCase()}
    </button>
  );
}
