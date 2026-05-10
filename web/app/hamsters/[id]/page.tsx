import { notFound } from "next/navigation";
import {
  GENDERS,
  Hamster,
  SPECIES,
  fetchHamster,
  formatAge,
  formatFee,
} from "@/lib/api";
import { paletteFor } from "@/lib/palettes";
import { Squircle } from "@/components/ui/Squircle";
import { ConnectedPills } from "@/components/ui/ConnectedPills";
import { RevealUp } from "@/components/motion/RevealUp";
import { ContactCurrentHumanToggle } from "./ContactCurrentHumanToggle";
import { DetailBackToBrowseLink } from "./DetailBackToBrowseLink";
import { MiniMapBlock } from "./MiniMapBlock";

/**
 * Hamster detail — Tesoro pattern: full-bleed coloured section that
 * reuses the same deterministic palette as the hamster's grid card,
 * so clicking a card feels like walking into the card. Large squircle
 * photo on a saturated accent, display-lg name, pill-style spec chips,
 * and matching-tint story / comes-with / contact blocks.
 *
 * 404s if the id is non-numeric or missing.
 */
export default async function HamsterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  let hamster: Hamster;
  try {
    hamster = await fetchHamster(numericId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("404")) notFound();
    throw err;
  }

  const speciesLabel =
    SPECIES.find((s) => s.value === hamster.species)?.label ?? hamster.species;
  const genderLabel =
    GENDERS.find((g) => g.value === hamster.gender)?.label ?? hamster.gender;
  const palette = paletteFor(hamster.id);

  const specs: { label: string; value: string }[] = [
    { label: "Species", value: speciesLabel },
    { label: "Age", value: formatAge(hamster.age_months) },
    { label: "Gender", value: genderLabel },
    ...(hamster.color ? [{ label: "Color", value: hamster.color }] : []),
    ...(hamster.temperament
      ? [{ label: "Temperament", value: hamster.temperament }]
      : []),
    ...(hamster.location
      ? [{ label: "Location", value: hamster.location }]
      : []),
  ];

  return (
    <section
      data-tone={palette.tone}
      className="relative w-full"
      style={{ background: palette.bg, color: palette.fg }}
    >
      <div
        className="mx-auto flex w-full flex-col"
        style={{
          maxWidth: 1280,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(7rem, 14vh, 11rem)",
          paddingBottom: "clamp(4rem, 9vh, 7rem)",
          gap: "clamp(2.5rem, 5vh, 4rem)",
        }}
      >
        <RevealUp>
          <DetailBackToBrowseLink fg={palette.fg}>
            <span aria-hidden>←</span>
            <span>Back to all hamsters</span>
          </DetailBackToBrowseLink>
        </RevealUp>

        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14">
          {/* LEFT — squircle photo on an accent pad */}
          <RevealUp className="flex justify-center lg:justify-start">
            <div
              className="rounded-[2.25rem] p-6 sm:p-8"
              style={{
                background: "color-mix(in srgb, currentColor 8%, transparent)",
                width: "100%",
                maxWidth: 520,
              }}
            >
              <Squircle
                className="aspect-square w-full"
                style={{ background: palette.accent }}
              >
                {hamster.photo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={hamster.photo_url}
                    alt={hamster.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center"
                    style={{
                      fontSize: "clamp(120px, 18vw, 220px)",
                      lineHeight: 1,
                    }}
                  >
                    🐹
                  </div>
                )}
              </Squircle>
            </div>
          </RevealUp>

          {/* RIGHT — name, fee, eyebrow, spec pills */}
          <div className="flex flex-col gap-6">
            <RevealUp className="flex flex-col items-start gap-4">
              <ConnectedPills
                parts={["LOOKING FOR", "A HOME"]}
                tones={palette.pills}
              />
              <h1
                className="display-xl"
                style={{ color: palette.fg, maxWidth: "12ch" }}
              >
                {hamster.name.toLowerCase()}
                <span style={{ color: palette.accent }}>.</span>
              </h1>
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: palette.fg, opacity: 0.7 }}
              >
                {[speciesLabel, formatAge(hamster.age_months), hamster.color]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </RevealUp>

            <RevealUp delay={0.1}>
              <div
                className="inline-flex items-center gap-3 rounded-full px-5 py-3"
                style={{ background: palette.chip, color: palette.chipFg }}
              >
                <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">
                  Adoption fee
                </span>
                <span
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    fontSize: "clamp(1.125rem, 1.6vw, 1.375rem)",
                  }}
                >
                  {formatFee(hamster.adoption_fee_cents)}
                </span>
              </div>
            </RevealUp>

            <RevealUp delay={0.2}>
              {/* Spec list: label above value inside a soft rounded card.
                  Two-column grid on wider screens so multi-line values
                  like "Curious, gentle, surprisingly opinionated about
                  millet." wrap cleanly without blowing out mobile width. */}
              <dl
                className="grid w-full grid-cols-1 gap-x-6 gap-y-3 rounded-[1.5rem] px-5 py-4 sm:grid-cols-2"
                style={{
                  background:
                    "color-mix(in srgb, currentColor 8%, transparent)",
                }}
              >
                {specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex flex-col gap-1 min-w-0"
                  >
                    <dt
                      className="text-[0.65rem] font-bold uppercase tracking-[0.18em]"
                      style={{ opacity: 0.6 }}
                    >
                      {s.label}
                    </dt>
                    <dd className="text-sm font-semibold leading-snug break-words">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </RevealUp>
          </div>
        </div>

        {/* Story + Comes with + Contact — stacked tinted blocks */}
        <div className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3">
          {hamster.story ? (
            <RevealUp
              delay={0.1}
              className="lg:col-span-2"
            >
              <article
                className="flex h-full flex-col gap-4 rounded-[1.75rem] p-7 sm:p-9"
                style={{
                  background:
                    "color-mix(in srgb, currentColor 8%, transparent)",
                }}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ opacity: 0.65 }}
                >
                  Their story
                </h2>
                <p className="body-main whitespace-pre-wrap">{hamster.story}</p>
              </article>
            </RevealUp>
          ) : null}

          <RevealUp delay={0.2}>
            <aside
              className="flex h-full flex-col gap-4 rounded-[1.75rem] p-7 sm:p-9"
              style={{
                background: palette.accent,
                color: palette.accentFg,
              }}
            >
              <h2
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ opacity: 0.75 }}
              >
                Current human
              </h2>
              <p
                className="font-display"
                style={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  fontSize: "clamp(1.5rem, 2vw, 1.875rem)",
                }}
              >
                {hamster.current_human_name}
              </p>
              <ContactCurrentHumanToggle
                email={hamster.current_human_email}
                hamsterName={hamster.name}
                hamsterId={hamster.id}
              />
            </aside>
          </RevealUp>

          {hamster.includes ? (
            <RevealUp delay={0.3} className="lg:col-span-3">
              <article
                className="flex flex-col gap-4 rounded-[1.75rem] p-7 sm:p-9"
                style={{
                  background:
                    "color-mix(in srgb, currentColor 8%, transparent)",
                }}
              >
                <h2
                  className="text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ opacity: 0.65 }}
                >
                  Comes with
                </h2>
                <p className="body-main whitespace-pre-wrap">
                  {hamster.includes}
                </p>
              </article>
            </RevealUp>
          ) : null}

          {hamster.latitude !== null && hamster.longitude !== null ? (
            <RevealUp delay={0.35} className="lg:col-span-3">
              <article
                className="flex flex-col gap-4 rounded-[1.75rem] p-7 sm:p-9"
                style={{
                  background:
                    "color-mix(in srgb, currentColor 8%, transparent)",
                }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={{ opacity: 0.65 }}
                  >
                    Where
                  </h2>
                  <p className="text-sm font-semibold">
                    {hamster.location || "—"}
                  </p>
                </div>
                <div
                  className="overflow-hidden rounded-2xl"
                  style={{ height: 280, background: "var(--cream)" }}
                >
                  <MiniMapBlock
                    latitude={hamster.latitude}
                    longitude={hamster.longitude}
                    label={hamster.location || hamster.name}
                  />
                </div>
              </article>
            </RevealUp>
          ) : null}
        </div>
      </div>
    </section>
  );
}
