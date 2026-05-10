import { ConnectedPills } from "@/components/ui/ConnectedPills";
import { Squircle } from "@/components/ui/Squircle";
import { PillCTA } from "@/components/ui/PillCTA";

/**
 * Global 404 — also doubles as the fallback for a hamster id that
 * doesn't resolve. Mirrors the Tesoro pattern: coloured section, pill
 * eyebrow, big display headline, and a soft return-home CTA.
 */
export default function NotFound() {
  return (
    <section
      data-tone="mustard-base"
      className="relative w-full"
      style={{ background: "var(--mustard-base)", color: "var(--mustard-dark)" }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center text-center"
        style={{
          maxWidth: 960,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(7rem, 16vh, 12rem)",
          paddingBottom: "clamp(5rem, 11vh, 9rem)",
          gap: "clamp(2rem, 4.5vh, 3rem)",
        }}
      >
        <Squircle
          className="h-28 w-28 sm:h-36 sm:w-36"
          style={{ background: "var(--mustard)" }}
        >
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ fontSize: "clamp(56px, 9vw, 84px)", lineHeight: 1 }}
          >
            🐹
          </div>
        </Squircle>

        <ConnectedPills parts={["NOTHING", "HERE"]} tones={["ink", "mustard"]} />

        <h1
          className="display-xl mx-auto"
          style={{ maxWidth: "14ch", color: "var(--mustard-dark)" }}
        >
          small hamster,
          <br />
          <span style={{ color: "var(--coral)" }}>big empty page.</span>
        </h1>

        <p
          className="body-lead mx-auto max-w-[48ch]"
          style={{ color: "var(--mustard-dark)", opacity: 0.85 }}
        >
          The hamster you&rsquo;re looking for has scurried off. Try the
          grid for ones still waiting, or list one of your own.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <PillCTA href="/#hamsters">meet the hamsters</PillCTA>
          <PillCTA href="/rehome" variant="cream">
            rehome yours
          </PillCTA>
        </div>
      </div>
    </section>
  );
}
