import { ConnectedPills } from "@/components/ui/ConnectedPills";
import { RevealChars } from "@/components/motion/RevealChars";
import { RevealUp } from "@/components/motion/RevealUp";

const STEPS = [
  {
    n: "01",
    title: "tell their story",
    body: "Photos, quirks, favourite snacks. The honest version that helps the right human find them.",
    bg: "var(--peach)",
    fg: "var(--coral-dark)",
    chip: "var(--coral)",
    chipFg: "var(--cream)",
  },
  {
    n: "02",
    title: "find a match",
    body: "Browse little ones near you. Send a gentle hello to their current human and chat.",
    bg: "var(--pink)",
    fg: "var(--rose-dark)",
    chip: "var(--rose)",
    chipFg: "var(--cream)",
  },
  {
    n: "03",
    title: "meet up",
    body: "In person, in public, with their habitat. No surprises, no shipping. Pets only.",
    bg: "var(--coral)",
    fg: "var(--cream)",
    chip: "var(--cream)",
    chipFg: "var(--coral-dark)",
  },
  {
    n: "04",
    title: "soft landing",
    body: "They settle in. You stay in touch if you'd like. Beatrice approves.",
    bg: "var(--teal)",
    fg: "var(--cream)",
    chip: "var(--cream)",
    chipFg: "var(--teal-dark)",
  },
];

/**
 * Section D — explainer. Tesoro pattern: pale mustard background, center
 * heading with connected pills, then four large coloured tiles each
 * carrying its own colour family. Each tile uses a squircle-clipped
 * stage number as its anchor.
 */
export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      data-tone="mustard-base"
      className="relative w-full"
      style={{
        background: "var(--mustard-base)",
        color: "var(--mustard-dark)",
      }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center"
        style={{
          maxWidth: 1440,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(5rem, 11vh, 9rem)",
          paddingBottom: "clamp(5rem, 11vh, 9rem)",
          gap: "clamp(2.5rem, 5vh, 4rem)",
        }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <RevealUp>
            <ConnectedPills
              parts={["HOW IT", "WORKS"]}
              tones={["mustard", "ink"]}
            />
          </RevealUp>
          <h2
            className="display-lg mx-auto"
            style={{ maxWidth: "20ch", color: "var(--mustard-dark)" }}
          >
            <RevealChars as="span">four small steps, </RevealChars>
            <RevealChars as="span" delay={0.1} className="text-[color:var(--coral)]">
              one soft landing.
            </RevealChars>
          </h2>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <RevealUp key={step.n} delay={i * 0.08}>
              <div
                className="flex h-full flex-col gap-5 rounded-[1.75rem] p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-7"
                style={{
                  background: step.bg,
                  color: step.fg,
                  minHeight: 280,
                }}
              >
                <span
                  className="stage-number"
                  style={{ background: step.chip, color: step.chipFg }}
                >
                  {step.n}
                </span>
                <h3
                  className="font-display"
                  style={{
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    lineHeight: 0.95,
                    fontSize: "clamp(1.625rem, 2.2vw, 2rem)",
                    color: step.fg,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="body-main"
                  style={{ color: step.fg, opacity: 0.9 }}
                >
                  {step.body}
                </p>
              </div>
            </RevealUp>
          ))}
        </div>
      </div>
    </section>
  );
}
