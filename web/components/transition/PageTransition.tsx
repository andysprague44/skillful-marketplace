"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/components/motion/SmoothScroll";

/**
 * Tesoro-style "curtain" page transition: a full-bleed colored panel
 * sweeps in from below, a squircle-clipped logo pops in, then on route
 * change the panel sweeps off the top.
 *
 * While the curtain is up, the hamster face runs an ambient loop
 * (breathe + blink + head tilt) so the wait feels warm instead of
 * empty. Loop is killed the moment the curtain starts lifting.
 *
 * Internal `<a>` clicks are intercepted so we can play the curtain
 * before navigating. External, hash, and modifier-clicks pass through.
 *
 * Skipped entirely under prefers-reduced-motion.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  // Search params are part of "where we are" — pagination links and filter
  // submissions only change the query string, so we need to lift the curtain
  // on those navigations too. Without this, ?page=2 etc. would leave the
  // curtain stuck because pathname-only deps never re-fire.
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const hammyRef = useRef<HTMLImageElement>(null);
  const ambientRef = useRef<gsap.core.Timeline | null>(null);
  const navigatingRef = useRef(false);
  // Set when we're about to arrive from a navigation curtain — lets the
  // reveal effect know the hamster has already animated during the
  // curtain-in hold, so it can skip the extra intro hold and wave off
  // immediately.
  const arrivedFromNavRef = useRef(false);
  // True until the very first reveal effect runs. Lets us distinguish
  // "first paint" (which should play the soft intro) from search-only
  // soft navigations like pagination and filter submits (which should
  // not flash the curtain at all).
  const initialMountRef = useRef(true);

  // Start the cute ambient loop on the hamster face. Idempotent:
  // calling twice will not stack loops.
  const startHammyAmbient = () => {
    const hammy = hammyRef.current;
    if (!hammy) return;
    if (ambientRef.current) return;

    // Reset transforms so every run starts clean.
    gsap.set(hammy, {
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      y: 0,
      transformOrigin: "50% 70%",
    });

    // Single looping timeline: breathe twice, then blink, then a
    // playful head tilt, then back to breathing. ~2.8s cycle.
    ambientRef.current = gsap
      .timeline({ repeat: -1 })
      .to(hammy, { y: -3, scale: 1.04, duration: 0.85, ease: "sine.inOut" })
      .to(hammy, { y: 0, scale: 1, duration: 0.85, ease: "sine.inOut" })
      .to(hammy, { scaleY: 0.55, duration: 0.09, ease: "power2.in" }, "+=0.1")
      .to(hammy, { scaleY: 1, duration: 0.12, ease: "power2.out" })
      .to(
        hammy,
        { rotation: -7, duration: 0.22, ease: "power2.out" },
        "+=0.25",
      )
      .to(hammy, { rotation: 5, duration: 0.28, ease: "power2.inOut" })
      .to(hammy, { rotation: 0, duration: 0.22, ease: "power2.out" });
  };

  const stopHammyAmbient = () => {
    ambientRef.current?.kill();
    ambientRef.current = null;
    const hammy = hammyRef.current;
    if (hammy) {
      gsap.set(hammy, { scale: 1, scaleX: 1, scaleY: 1, rotation: 0, y: 0 });
    }
  };

  // Reveal on mount + on every pathname change.
  useEffect(() => {
    const curtain = curtainRef.current;
    const logo = logoRef.current;
    if (!curtain || !logo) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(curtain, { autoAlpha: 0 });
      navigatingRef.current = false;
      return;
    }

    const fromNav = arrivedFromNavRef.current;
    arrivedFromNavRef.current = false;
    const isInitialMount = initialMountRef.current;
    initialMountRef.current = false;

    // Soft, search-only navigations (pagination, filter submits) do NOT
    // come through the click interceptor — they bypass it because the
    // pathname is unchanged — and we don't want them to play the curtain
    // at all. Otherwise pagination flashes the full-screen teal panel
    // and force-scrolls back to the hash, which feels jarring against
    // what should be a quick in-place card swap. Only the initial mount
    // and real route changes (fromNav) get the curtain treatment.
    if (!fromNav && !isInitialMount) {
      gsap.set(curtain, { autoAlpha: 0 });
      navigatingRef.current = false;
      return;
    }

    // If we just navigated, the curtain is already covering — wipe it off.
    // If this is initial load, do a soft reveal so the first paint is intentional.
    const tl = gsap.timeline({
      onComplete: () => {
        navigatingRef.current = false;
        const lenis = getLenis();
        lenis?.start();
        gsap.set(curtain, { yPercent: 0, autoAlpha: 0 });

        // If the destination URL carries a hash (e.g. `/#hamsters`
        // from the nav's Browse pill) smooth-scroll Lenis to it now
        // that the page is fully visible. Native hash anchors would
        // jump instantly and bypass Lenis; this gives the same calm
        // glide as in-page scroll.
        if (typeof window !== "undefined") {
          const hash = window.location.hash;
          if (hash && hash !== "#") {
            // Wait two animation frames so the destination DOM has
            // had a chance to paint and Lenis has ticked at least
            // once after `start()`. A small `setTimeout` further
            // guards against React still flushing layout effects
            // for newly-mounted client subtrees (HamsterGrid, etc.).
            // `force: true` overrides Lenis' "is user scrolling"
            // guard in case Next.js's automatic scroll restoration
            // also queued a scroll on this same tick.
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  const target = document.querySelector(hash);
                  if (!target) return;
                  if (lenis) {
                    lenis.scrollTo(target as HTMLElement, {
                      offset: -72,
                      duration: 1.1,
                      force: true,
                    });
                  } else {
                    (target as HTMLElement).scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }, 80);
              });
            });
          }
        }
      },
    });

    // Belt: make absolutely sure we land at the top of the new page
    // before the curtain lifts. `playCurtainIn` already scrolled to 0
    // before firing `router.push`, but if React/Next reschedules work
    // the native scroll position can drift back to the old value while
    // the new, shorter page is mounting (visible as a jump to the
    // footer). Re-asserting here while the curtain is still opaque
    // makes the bug unreproducible regardless of timing.
    if (fromNav && typeof window !== "undefined") {
      const hasHash = window.location.hash && window.location.hash !== "#";
      if (!hasHash) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      }
    }

    tl.set(curtain, { autoAlpha: 1, yPercent: 0 }).set(logo, {
      autoAlpha: 1,
      scale: 1,
    });

    // On first page load there's no preceding curtain-in, so give the
    // hamster a moment to be cute before we say goodbye. On arrival
    // from a navigation, the hamster already breathed during the
    // curtain-in hold, so skip straight to the wave.
    if (!fromNav) {
      tl.call(startHammyAmbient).to({}, { duration: 1.0 });
    }

    tl
      // Tiny "goodbye wave" before the logo fades — one last squish so
      // the hamster feels like it's sending the user off.
      .to(logo, {
        scale: 1.08,
        duration: 0.22,
        ease: "back.out(2)",
        onStart: stopHammyAmbient,
      })
      .to(logo, { autoAlpha: 0, scale: 0.88, duration: 0.3, ease: "power2.in" })
      .to(
        curtain,
        { yPercent: -100, duration: 0.85, ease: "expo.inOut" },
        "-=0.08",
      );

    return () => {
      tl.kill();
      stopHammyAmbient();
    };
  }, [pathname, search]);

  // Intercept internal link clicks, play curtain in, then navigate.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      const anchor = (e.target as Element | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;
      // Same-pathname, search-only navigations (pagination, filter submits)
      // are in-place data swaps, not real page transitions — skip the
      // curtain so they feel snappy. Next.js will handle the soft nav.
      if (url.pathname === window.location.pathname) return;

      // Capture-phase listener fires before next/link's onClick, so we
      // stop propagation to prevent Link from also calling router.push
      // (which would race with our curtain timeline and bypass the
      // scroll reset below).
      e.preventDefault();
      e.stopPropagation();
      const dest = url.pathname + url.search + url.hash;
      const destHasHash = Boolean(url.hash && url.hash !== "#");
      playCurtainIn(() => {
        // Snap the native scroll to the top *before* we push the new
        // route so the incoming page always mounts at y=0. If we skip
        // this, Lenis is stopped at the old scroll offset and Next's
        // built-in scroll-to-top doesn't land while Lenis is paused —
        // which means a shorter new page clamps its scroll to the
        // bottom and the user sees the footer first.
        if (!destHasHash) {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
        }
        router.push(dest);
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  const playCurtainIn = (then: () => void) => {
    const curtain = curtainRef.current;
    const logo = logoRef.current;
    if (!curtain || !logo) {
      then();
      return;
    }
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    getLenis()?.stop();

    gsap.set(curtain, { autoAlpha: 1, yPercent: 100 });
    gsap.set(logo, { autoAlpha: 0, scale: 0.6, rotate: -20 });
    stopHammyAmbient();

    const tl = gsap.timeline({
      onComplete: () => {
        arrivedFromNavRef.current = true;
        then();
      },
    });
    tl.to(curtain, { yPercent: 0, duration: 0.6, ease: "expo.inOut" })
      .to(
        logo,
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: 0.45,
          ease: "back.out(1.8)",
          onComplete: startHammyAmbient,
        },
        "-=0.2",
      )
      // Longer hold so the hamster gets to breathe, blink, and wiggle
      // at least once before we fire the actual navigation.
      .to({}, { duration: 1.1 });
  };

  return (
    <div
      ref={curtainRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--teal)",
        // Leaflet stacks its panes from 200 (tile) up to ~1000 (controls),
        // and the cursor hamster sits at 50, so the curtain has to clear
        // every one of them or routes that contain a map render *over*
        // the curtain during navigation.
        zIndex: 10000,
        opacity: 0,
        // Initial render is invisible (opacity: 0). GSAP toggles
        // `visibility: hidden` via `autoAlpha`, which also stops the
        // curtain catching clicks while it's hidden — so we can leave
        // pointer-events on and have it correctly block interaction
        // with the underlying page (Leaflet drag/zoom, link hovers,
        // etc.) while it's visible.
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={logoRef}
        className="clip-squircle"
        style={{
          width: "min(40vw, 220px)",
          aspectRatio: "1 / 1",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={hammyRef}
          src="/hammy.png"
          alt=""
          style={{
            width: "70%",
            height: "auto",
            willChange: "transform",
          }}
        />
      </div>
    </div>
  );
}
