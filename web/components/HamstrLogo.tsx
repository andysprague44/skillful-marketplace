"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The Hamstr brand mark. Uses the transparent hammy PNG so the logo
 * sits cleanly on any section colour without needing a blend mode.
 *
 * The hamster wiggles gently on hover via GSAP — small delight, not
 * distracting.
 */
export function HamstrLogo({
  size = 48,
  className = "",
  alt = "Hamstr",
  wiggle = true,
}: {
  size?: number;
  className?: string;
  alt?: string;
  wiggle?: boolean;
}) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!wiggle) return;
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let tl: gsap.core.Timeline | null = null;
    const onEnter = () => {
      tl?.kill();
      tl = gsap
        .timeline()
        .to(el, { rotation: -6, duration: 0.12, ease: "power2.out", transformOrigin: "50% 80%" })
        .to(el, { rotation: 5, duration: 0.18, ease: "power2.inOut" })
        .to(el, { rotation: -3, duration: 0.14, ease: "power2.inOut" })
        .to(el, { rotation: 0, duration: 0.18, ease: "power2.out" });
    };

    el.addEventListener("mouseenter", onEnter);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      tl?.kill();
    };
  }, [wiggle]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={ref}
      src="/hammy.png"
      alt={alt}
      width={size}
      height={size}
      className={`block ${className}`}
      style={{ width: size, height: "auto" }}
    />
  );
}
