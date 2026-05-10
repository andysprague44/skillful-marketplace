import { ConnectedPills } from "@/components/ui/ConnectedPills";
import { RevealChars } from "@/components/motion/RevealChars";
import { RevealUp } from "@/components/motion/RevealUp";
import { RehomeForm } from "./RehomeForm";

/**
 * Rehome-a-hamster page — Tesoro pattern: peach-base section with a
 * connected-pills eyebrow, a big display headline, and the form card
 * resting on a cream surface so inputs read crisply without fighting
 * the peach wash.
 */
export default function RehomePage() {
  return (
    <section
      data-tone="peach-base"
      className="relative w-full"
      style={{ background: "var(--peach-base)", color: "var(--coral-dark)" }}
    >
      <div
        className="mx-auto flex w-full flex-col items-center"
        style={{
          maxWidth: 960,
          paddingLeft: "var(--site-edge)",
          paddingRight: "var(--site-edge)",
          paddingTop: "clamp(7rem, 14vh, 11rem)",
          paddingBottom: "clamp(5rem, 10vh, 8rem)",
          gap: "clamp(2rem, 4.5vh, 3.5rem)",
        }}
      >
        <RevealUp className="flex flex-col items-center gap-6 text-center">
          <ConnectedPills
            parts={["REHOME A", "HAMSTER"]}
            tones={["coral", "peach"]}
          />
          <h1
            className="display-lg mx-auto"
            style={{ maxWidth: "18ch", color: "var(--coral-dark)" }}
          >
            <RevealChars as="span">tell their </RevealChars>
            <RevealChars
              as="span"
              delay={0.1}
              className="text-[color:var(--coral)]"
            >
              small story.
            </RevealChars>
          </h1>
          <p
            className="body-lead mx-auto max-w-[52ch]"
            style={{ color: "var(--coral-dark)", opacity: 0.85 }}
          >
            Every listing gets a story so the next human arrives prepared.
            Take your time. The honest details help the right person find
            them.
          </p>
        </RevealUp>

        <RevealUp delay={0.2} className="w-full">
          <RehomeForm />
        </RevealUp>
      </div>
    </section>
  );
}
