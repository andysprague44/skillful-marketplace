"use client";

import { ReactNode, useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Soft fade-up for any block. Uses ScrollTrigger so the animation only
 * runs once the element is in view; ignored under prefers-reduced-motion.
 */
export function RevealUp({
  children,
  className = "",
  delay = 0,
  y = 32,
  duration = 0.8,
  start = "top 85%",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  start?: string;
  as?: "div" | "section" | "li" | "ul" | "header" | "footer";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.set(el, { y, opacity: 0 });
      ScrollTrigger.create({
        trigger: el,
        start,
        once: true,
        onEnter: () =>
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration,
            delay,
            ease: "expo.out",
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, duration, start]);

  const Tag = As as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
