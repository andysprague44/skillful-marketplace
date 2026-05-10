"use client";

/**
 * Single registration point for GSAP plugins.
 *
 * Every client component that uses GSAP imports `gsap` from here so the
 * plugin registration runs exactly once. SplitText and ScrollTrigger ship
 * with the free GSAP bundle as of 3.13.
 */
import { useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

/**
 * Subscribe to `prefers-reduced-motion`. Returns `true` when the user has
 * asked the system to minimize motion. Components should fall back to
 * static layouts in that case.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
