"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  GENDERS,
  Gender,
  SPECIES,
  Species,
  createHamster,
} from "@/lib/api";

interface FormState {
  name: string;
  species: Species;
  age_months: string;
  gender: Gender;
  color: string;
  temperament: string;
  story: string;
  includes: string;
  fee: string;
  location: string;
  photo_url: string;
  current_human_name: string;
  current_human_email: string;
}

const INITIAL: FormState = {
  name: "",
  species: "munchkin",
  age_months: "",
  gender: "unknown",
  color: "",
  temperament: "",
  story: "",
  includes: "",
  fee: "",
  location: "",
  photo_url: "",
  current_human_name: "",
  current_human_email: "",
};

/**
 * Client-side form that validates inputs and POSTs to the API.
 *
 * Uses native HTML5 validation plus a couple of explicit checks for
 * the fee field so we can return integer cents to the API. Styled to
 * match the Hamstr/Tesoro system: cream card on a peach section,
 * ink-focused inputs, dark pill CTA submit.
 */
export function RehomeForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const ageNum = Number(values.age_months || "0");
    if (!Number.isFinite(ageNum) || ageNum < 0) {
      setError("Age must be a non-negative number of months.");
      return;
    }

    const feeNum = Number(values.fee || "0");
    if (!Number.isFinite(feeNum) || feeNum < 0) {
      setError("Adoption fee must be a non-negative number (0 means free).");
      return;
    }

    setSubmitting(true);
    try {
      const hamster = await createHamster({
        name: values.name.trim(),
        species: values.species,
        age_months: Math.round(ageNum),
        gender: values.gender,
        color: values.color.trim(),
        temperament: values.temperament.trim(),
        story: values.story.trim(),
        includes: values.includes.trim(),
        adoption_fee_cents: Math.round(feeNum * 100),
        location: values.location.trim(),
        photo_url: values.photo_url.trim(),
        current_human_name: values.current_human_name.trim(),
        current_human_email: values.current_human_email.trim(),
      });
      router.push(`/hamsters/${hamster.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post hamster");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-shadow flex flex-col gap-7 rounded-[2rem] p-6 sm:p-10"
      style={{ background: "var(--cream)", color: "var(--ink)" }}
    >
      <Group title="About them">
        <Field label="Their name" required>
          <input
            required
            minLength={1}
            maxLength={80}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Beatrice"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Species" required>
            <select
              value={values.species}
              onChange={(e) => update("species", e.target.value as Species)}
              className={inputClass}
            >
              {SPECIES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender">
            <select
              value={values.gender}
              onChange={(e) => update("gender", e.target.value as Gender)}
              className={inputClass}
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Age (months)">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step="1"
              value={values.age_months}
              onChange={(e) => update("age_months", e.target.value)}
              placeholder="6"
              className={inputClass}
            />
          </Field>
          <Field label="Color">
            <input
              maxLength={64}
              value={values.color}
              onChange={(e) => update("color", e.target.value)}
              placeholder="Golden"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Temperament">
          <input
            maxLength={120}
            value={values.temperament}
            onChange={(e) => update("temperament", e.target.value)}
            placeholder="Curious, gentle, loves sunflower seeds"
            className={inputClass}
          />
        </Field>
      </Group>

      <Group title="Their story">
        <Field label="A few sentences about them">
          <textarea
            rows={5}
            maxLength={5000}
            value={values.story}
            onChange={(e) => update("story", e.target.value)}
            placeholder="How long you've had them, what they're like, why you're rehoming…"
            className={`${inputClass} min-h-32`}
          />
        </Field>

        <Field label="Comes with">
          <textarea
            rows={2}
            maxLength={2000}
            value={values.includes}
            onChange={(e) => update("includes", e.target.value)}
            placeholder="Cage, wheel, food, bedding…"
            className={`${inputClass} min-h-16`}
          />
        </Field>

        <Field label="Photo URL">
          <input
            type="url"
            maxLength={500}
            value={values.photo_url}
            onChange={(e) => update("photo_url", e.target.value)}
            placeholder="https://…"
            className={inputClass}
          />
        </Field>
      </Group>

      <Group title="The handoff">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Adoption fee (USD)">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              value={values.fee}
              onChange={(e) => update("fee", e.target.value)}
              placeholder="0 = free"
              className={inputClass}
            />
          </Field>
          <Field label="Location">
            <input
              maxLength={120}
              value={values.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Ottawa, ON"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Your name" required>
            <input
              required
              minLength={1}
              maxLength={120}
              value={values.current_human_name}
              onChange={(e) => update("current_human_name", e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact email" required>
            <input
              required
              type="email"
              value={values.current_human_email}
              onChange={(e) => update("current_human_email", e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </Field>
        </div>
      </Group>

      {error ? (
        <p
          className="rounded-2xl px-4 py-3 text-sm font-medium"
          style={{
            background: "color-mix(in srgb, var(--rose) 18%, transparent)",
            color: "var(--rose-dark)",
            border:
              "1px solid color-mix(in srgb, var(--rose) 40%, transparent)",
          }}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="pill-cta mt-2 w-full justify-between self-stretch disabled:opacity-60"
      >
        <span>{submitting ? "Posting…" : "Post their listing"}</span>
        <span className="pill-cta__icon" aria-hidden>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m13 5 7 7-7 7" />
          </svg>
        </span>
      </button>
    </form>
  );
}

// Soft translucent ink borders + clean focus ring that reads on cream.
const inputClass =
  "w-full rounded-xl border bg-white/60 px-4 py-3 text-base leading-tight text-[color:var(--ink)] placeholder:text-[color:var(--ink-soft)]/60 transition-colors focus:border-[color:var(--ink)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ink)]/15 border-[color:var(--ink)]/15";

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4 border-0 p-0">
      <legend
        className="label-eyebrow mb-1"
        style={{ color: "var(--ink-soft)" }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--ink-soft)" }}
      >
        {label}
        {required ? (
          <span
            className="ml-1"
            style={{ color: "var(--coral)" }}
            aria-hidden
          >
            *
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
