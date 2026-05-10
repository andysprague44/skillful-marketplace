import { FallingHamstrShapes } from "./FallingHamstrShapes";
import { MailingListForm } from "./MailingListForm";
import { HamstrWordmark } from "@/components/HamstrWordmark";

/**
 * Site-wide footer — Tesoro pattern: dark/inky background, the
 * tagline + mailing-list block in the upper third, then a HUGE
 * "hamstr" wordmark at the bottom with a pile of coloured hamster
 * silhouettes settled on top.
 *
 * The shape pile lives in its own absolutely-positioned layer in the
 * bottom 60% so it never overlaps the upper content.
 */
export function HamstrFooter() {
  return (
    <footer
      data-tone="ink"
      className="relative w-full overflow-hidden"
      style={{ background: "var(--ink)", color: "var(--cream)" }}
    >
      <div
        className="relative z-10 mx-auto flex w-full flex-col"
        style={{
          maxWidth: 1440,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(4rem, 9vh, 7rem)",
          paddingBottom: 0,
          gap: "clamp(2rem, 4vh, 3rem)",
        }}
      >
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <h2
            className="display-lg"
            style={{ color: "var(--cream)", maxWidth: "16ch" }}
          >
            made in canada,
            <br />
            <span style={{ color: "var(--mustard)" }}>for hamsters everywhere.</span>
          </h2>
          <p
            className="body-main max-w-md"
            style={{ color: "color-mix(in srgb, var(--cream) 75%, transparent)" }}
          >
            One gentle email a month. New listings near you, care tips,
            and the occasional Beatrice update.
          </p>
          <MailingListForm />
        </div>

        <div
          className="mt-6 flex flex-col items-start justify-between gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center"
          style={{
            borderColor: "color-mix(in srgb, var(--cream) 18%, transparent)",
            color: "color-mix(in srgb, var(--cream) 65%, transparent)",
          }}
        >
          <span>© {new Date().getFullYear()} Hamstr · Canada</span>
          <span>Drag the hamsters around. They like it!</span>
        </div>
      </div>

      {/* The shape pile + wordmark area. The shape canvas occupies the
          full area; shapes settle near the bottom and rest on the
          wordmark below. Compact height so there's no empty dark
          gap between the upper content and the pile. */}
      <div
        className="relative mt-6 w-full overflow-hidden sm:mt-10"
        style={{ height: "clamp(260px, 34vh, 420px)" }}
      >
        {/* Big wordmark — anchored at the bottom of the area, full
            bleed. SVG-masked cream paint replaces the text-rendered
            "hamstr" so the silhouette is razor-sharp behind the
            falling shape pile. The slight downward translate lets the
            wordmark bleed off the bottom edge for that Tesoro feel. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex w-full items-end justify-center"
          style={{
            paddingLeft: "var(--site-edge)",
            paddingRight: "var(--site-edge)",
          }}
          aria-hidden
        >
          <HamstrWordmark
            variant="cream"
            style={{
              width: "100%",
              transform: "translateY(10%)",
            }}
          />
        </div>
        <FallingHamstrShapes />
      </div>
    </footer>
  );
}
