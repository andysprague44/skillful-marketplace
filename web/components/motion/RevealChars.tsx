"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

/**
 * SplitText character-stagger reveal. Each character drops up + fades
 * in once the wrapper enters the viewport. Falls back to a static
 * render under prefers-reduced-motion.
 *
 * IMPORTANT: words and chars both get inline-block, but the WORD is
 * the masking element (overflow:hidden) — this lets text wrap on
 * word boundaries instead of breaking inside a word.
 */
export function RevealChars({
  children,
  as: As = "span",
  className = "",
  delay = 0,
  stagger = 0.022,
  duration = 0.7,
  start = "top 85%",
  scrub = false,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
  scrub?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let split: SplitText | null = null;
    let trigger: ScrollTrigger | null = null;

    const ctx = gsap.context(() => {
      split = new SplitText(el, {
        type: "lines,words,chars",
        linesClass: "rc-line",
        wordsClass: "rc-word",
        charsClass: "rc-char",
      });
      gsap.set(split.chars, { yPercent: 110, opacity: 0 });

      const tween = gsap.to(split.chars, {
        yPercent: 0,
        opacity: 1,
        duration,
        delay,
        ease: "expo.out",
        stagger,
        paused: true,
      });

      trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once: !scrub,
        onEnter: () => tween.play(),
      });
    }, el);

    return () => {
      trigger?.kill();
      split?.revert();
      ctx.revert();
    };
  }, [delay, stagger, duration, start, scrub]);

  const Tag = As as "span";
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={`rc-host ${className}`}
    >
      {children}
    </Tag>
  );
}
