"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A tiny hamster that follows the cursor with a springy delay. Hidden on
 * touch devices and under prefers-reduced-motion. Renders inside its
 * parent (so it can be scoped to the hero only) — uses a fixed-position
 * element under the hood.
 *
 * `containerSelector` lets you scope it: when the cursor is outside the
 * matched container, the hamster fades out.
 */
export function CursorHamster({
  containerSelector,
}: {
  containerSelector?: string;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none) or (pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
    let visible = false;
    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      gsap.to(el, {
        autoAlpha: v ? 1 : 0,
        scale: v ? 1 : 0.6,
        duration: 0.35,
        ease: "power2.out",
      });
    };

    const container = containerSelector
      ? (document.querySelector(containerSelector) as HTMLElement | null)
      : null;

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);

      if (container) {
        const rect = container.getBoundingClientRect();
        const inside =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        setVisible(inside);
      } else {
        setVisible(true);
      }
    };
    const onLeave = () => setVisible(false);

    gsap.set(el, { autoAlpha: 0, xPercent: -50, yPercent: -50, scale: 0.6 });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [containerSelector]);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 50,
        pointerEvents: "none",
        fontSize: "2.25rem",
        lineHeight: 1,
        filter: "drop-shadow(0 4px 8px rgba(31,36,33,0.25))",
        willChange: "transform",
      }}
    >
      🐹
    </div>
  );
}
