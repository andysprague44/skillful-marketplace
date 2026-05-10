"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { gsap, SplitText } from "@/lib/gsap";

/**
 * Tesoro-style nav link. On hover, sweeps a wave of color through the
 * individual characters via SplitText. Touch devices and
 * prefers-reduced-motion get a static fallback.
 */
export function StaggerHoverLink({
  href,
  children,
  hoverColor = "var(--mustard)",
  className = "",
  external = false,
  onClick,
}: {
  href: string;
  children: string;
  hoverColor?: string;
  className?: string;
  external?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const split = new SplitText(el.querySelector("[data-stagger-text]")!, { type: "chars" });
      const baseColor = getComputedStyle(el).color;

      const onEnter = () => {
        gsap.killTweensOf(split.chars);
        gsap.to(split.chars, {
          color: hoverColor,
          duration: 0.15,
          ease: "none",
          stagger: { each: 0.025, from: "start" },
        });
      };
      const onLeave = () => {
        gsap.killTweensOf(split.chars);
        gsap.to(split.chars, {
          color: baseColor,
          duration: 0.18,
          ease: "none",
          stagger: { each: 0.02, from: "start" },
        });
      };

      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);

      return () => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        split.revert();
      };
    });

    return () => mm.revert();
  }, [hoverColor]);

  const inner = <span data-stagger-text>{children}</span>;

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={onClick}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={className} onClick={onClick}>
      {inner}
    </Link>
  );
}
