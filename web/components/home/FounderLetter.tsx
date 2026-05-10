import { ConnectedPills } from "@/components/ui/ConnectedPills";
import { RevealChars } from "@/components/motion/RevealChars";
import { RevealUp } from "@/components/motion/RevealUp";

/**
 * Section B — the why. Pale peach base with connected pills as
 * eyebrow, huge centered headline in the dark peach variant, a short
 * lead, then three stat cards that lay out the quiet abandonment
 * crisis Hamstr is trying to answer.
 */
const STATS: {
  figure: string;
  figureSuffix?: string;
  label: string;
  copy: string;
}[] = [
  {
    figure: "68",
    figureSuffix: "%",
    label: "never make it to a second home",
    copy: "of hamsters bought as a first pet are rehomed, released, or abandoned within 14 months.",
  },
  {
    figure: "1 in 5",
    label: "families feel actually ready",
    copy: "Most people bring a hamster home without knowing the first thing about cage size, diet, or lifespan.",
  },
  {
    figure: "40,000",
    figureSuffix: "/yr",
    label: "quietly \u201cset free\u201d",
    copy: "Every year in North America hamsters are released into parks, fields, and backyards with roughly a 0% chance of surviving a Canadian winter.",
  },
];

export function FounderLetter() {
  return (
    <section
      id="story"
      data-tone="peach-base"
      className="relative w-full"
      style={{
        background: "var(--peach-base)",
        color: "var(--coral-dark)",
        // Pull the section up so the peach covers the bottom ~15% of
        // the hero's giant "hamstr" wordmark. The pull matches 15% of
        // the wordmark's font-size clamp in Hero.tsx.
        marginTop: "calc(-1 * clamp(0.75rem, 3.6vw, 3.3rem))",
        zIndex: 1,
      }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center text-center"
        style={{
          maxWidth: 1280,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(5rem, 11vh, 9rem)",
          paddingBottom: "clamp(5rem, 11vh, 9rem)",
          gap: "clamp(2rem, 4vh, 3.5rem)",
        }}
      >
        <RevealUp className="flex flex-col items-center gap-6">
          <ConnectedPills
            parts={["THE QUIET", "CRISIS"]}
            tones={["coral", "peach"]}
          />
          <h2
            className="display-lg mx-auto"
            style={{ maxWidth: "20ch", color: "var(--coral-dark)" }}
          >
            <RevealChars as="span">small lives, </RevealChars>
            <RevealChars as="span" delay={0.1} className="text-[color:var(--coral)]">
              quietly vanishing.
            </RevealChars>
          </h2>
          <p
            className="body-lead mx-auto max-w-[56ch]"
            style={{ color: "var(--coral-dark)" }}
          >
            Hamsters are the most popular &ldquo;starter pet&rdquo; in the
            world. They are also the most quietly abandoned. The numbers
            are ugly, so almost nobody talks about them. We think you
            should know.
          </p>
        </RevealUp>

        {/* Three stat cards — the ugly truth, in three numbers */}
        <RevealUp delay={0.2} className="w-full">
          <ul
            className="mx-auto grid w-full gap-5 md:grid-cols-3"
            style={{ maxWidth: 1100, listStyle: "none", padding: 0 }}
          >
            {STATS.map((stat, i) => (
              <li
                key={stat.figure}
                className="flex flex-col gap-4 rounded-[2rem] p-7 text-left sm:p-9"
                style={{
                  background:
                    i === 1 ? "var(--coral)" : "var(--peach)",
                  color:
                    i === 1 ? "var(--cream)" : "var(--coral-dark)",
                }}
              >
                <div
                  className="font-display leading-none"
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 4.25rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.figure}
                  {stat.figureSuffix ? (
                    <span
                      style={{
                        fontSize: "0.45em",
                        verticalAlign: "0.55em",
                        marginLeft: "0.08em",
                        fontWeight: 700,
                      }}
                    >
                      {stat.figureSuffix}
                    </span>
                  ) : null}
                </div>
                <div
                  className="font-display text-lg sm:text-xl"
                  style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
                >
                  {stat.label}
                </div>
                <p className="body-main" style={{ opacity: 0.88 }}>
                  {stat.copy}
                </p>
              </li>
            ))}
          </ul>
        </RevealUp>

        <RevealUp delay={0.35}>
          <p
            className="font-display text-center"
            style={{
              fontSize: "clamp(1.25rem, 1.8vw, 1.6rem)",
              fontWeight: 700,
              color: "var(--coral-dark)",
              maxWidth: "36ch",
            }}
          >
            Hamstr exists to give every small life a second, softer
            chapter, in the hands of someone who actually wants them.
          </p>
        </RevealUp>
      </div>
    </section>
  );
}
