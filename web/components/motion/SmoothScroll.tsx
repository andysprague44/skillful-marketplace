"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Module-level singleton so other components (PageTransition, Footer)
 * can call `getLenis()?.stop()` / `.start()` without prop drilling.
 */
let _lenis: Lenis | null = null;
export function getLenis(): Lenis | null {
  return _lenis;
}

/**
 * Initialises Lenis once, drives its RAF loop with GSAP's ticker so
 * ScrollTrigger and Lenis stay perfectly in sync.
 *
 * Renders nothing — it's purely a side-effect component mounted in the
 * root layout.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    _lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  return null;
}
