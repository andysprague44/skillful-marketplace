"use client";

import { useEffect, useRef } from "react";
import type * as MatterNS from "matter-js";

// Tesoro-style: clean coloured hamster silhouettes in the brand
// family. No letters, hearts, or paws — variety comes from colour +
// size + rotation only. Weighted toward teal so the brand colour
// dominates.
const COLORS = [
  "#1f6e6a", // teal
  "#f08c70", // coral
  "#f3dc6e", // mustard
  "#e76e70", // rose
  "#f6c4c1", // pink
  "#1f6e6a", // teal again
  "#f08c70",
];

const COUNT = 18;

// SVG path data for /public/hamstouette.svg. Kept inline so we can
// render via Path2D into canvas (no extra fetch, no <img> layer).
// viewBox: 0 0 132.08 65.97 — roughly 2:1 wide.
const HAMSTR_VB_W = 132.08;
const HAMSTR_VB_H = 65.97;
const HAMSTR_ASPECT = HAMSTR_VB_W / HAMSTR_VB_H;
const HAMSTR_PATH_D =
  "M75.3,60.19l-4.59.68.07-1.12c-1.4.29-2.99.73-4.41.84-2.82-1.02-4.73,1.06-4.75-1.06l-10.34.76c-.22-.61-.6-.98-1-.95-2.58.23-4.67.14-7.47.22,3.61,1.95,10.82,2.77,9.57,6.4-5.66-.87-11.1-1.26-16.78-1.3-2.52-.02-5.09-.99-5.75-3.5l-1.08-4.07-4.94-.98-1.41-2.12c-.62-.93-1.2-1.6-2.22-2.16l-2.8-1.55c-.5-2.58-2.59-2.37-2.78-4.33-2.01-1.67-3.6-3.52-4.73-6.03l-4.78.11c-3.16.07-5.49-1.69-5.06-3.63.13-.59.91-1.45,1.64-1.68l6.43-1.99c.67-1.02,1.68-2.19,2.09-3.3.52-1.41.99-2.35,1.88-3.5l4.93-6.34c.97-1.25,1.53-2.9,2.8-3.92l5.72-4.62c1.64-1.32,3.39-2.34,5.14-3.5s3.46-2.21,5.72-2.46c5.08-.56,7.11-2.91,10.72-3.66,2.25-.47,4.45-1.3,6.79-1.32L74.7,0c1.8,0,3.38.66,4.97,1.26,1.73.65,3.61.54,5.43.85,3.44.57,6.73,1.42,10.2,1.64,2.22-.71,5.49.01,7.77,1l5.73,2.49,1.6,1.01c1.49-1.17,3.1-1.54,4.88-1.02,4.06,1.18,3.44,6.03,5.44,8.68,1.63,2.15,3.53,3.95,4.52,6.52l2.8,7.28c1.91,4.97,3.06,10.1,3.88,15.35.48,3.06-.08,6.5-1.94,5.83-1.14-.41-1.74-.14-2.57.62-1.62,1.47-4,2.72-6.19,2.01-1.23-.4-2.17-.94-3.55-.48-1.25.42-2.73.44-3.98-.07l-4.74-1.98c-1.39-.58-2.27-.91-3.6.1l-3.67,2.77-2.67,1.13-5.12,3.76-1.97,1.4,7.17,2.94.39,2.37c-2.09-.55-3.94-.82-6.05-.65-3.02.24-5.9.25-8.9-.2-.78-.12-1.28-1.02-1.34-1.78-.11-1.62-1.18-.88-1.68-2.26-.11.09-1.06.44-1.17.15l-.53-1.32c-.13-.33-1-.57-1.32-.42-.92.43-2.14,1.06-3.18,1.22Z";

type ShapeBody = MatterNS.Body & {
  _color?: string;
  _width?: number;
  _height?: number;
};

/**
 * Matter.js physics canvas pinned to the lower portion of the footer.
 * Drops a pile of solid coloured hamster silhouettes (the
 * `/hamstouette.svg` shape) that settle on top of the "hamstr"
 * wordmark. Initialises lazily via IntersectionObserver.
 *
 * Design goals:
 *   - Reliable across Chrome / Safari / Firefox, mouse + touch + pen
 *   - Crisp on any DPR (retina, 4K, Windows 125% scaling)
 *   - Survives container resizes (font swap, layout shift, image load)
 *   - Honours prefers-reduced-motion as a static no-op
 *   - No memory leaks on hot reload, route change, or React StrictMode
 */
export function FallingHamstrShapes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceQuery.matches) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cleanup: (() => void) | null = null;
    let cancelled = false;

    const init = async () => {
      if (cancelled || cleanup) return;

      const Matter = (await import("matter-js")).default;
      if (cancelled) return;
      const { Engine, Runner, World, Bodies, Body, Events } = Matter;

      // --- Sizing -----------------------------------------------------------
      // Wait until layout is ready before initialising. If we measure 0×0 we
      // schedule a retry on the next frame instead of bailing for good — this
      // matters when fonts/images shift the footer height after first paint.
      let width = container.clientWidth;
      let height = container.clientHeight;
      if (width === 0 || height === 0) {
        requestAnimationFrame(() => void init());
        return;
      }

      let dpr = Math.max(1, window.devicePixelRatio || 1);
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const sizeCanvas = () => {
        // Internal pixel buffer is DPR-scaled for crisp rendering, but the
        // CSS box stays at logical size. We then `setTransform` so all draw
        // calls operate in CSS pixel units.
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      sizeCanvas();

      // --- Physics world ----------------------------------------------------
      const engine = Engine.create({ gravity: { x: 0, y: 1.6 } });

      // Walls are oversized so bodies can't slip through corners during
      // resize and are easy to reposition.
      const WALL = 200;
      const floor = Bodies.rectangle(
        width / 2,
        height + WALL / 2,
        Math.max(width, 200) * 4,
        WALL,
        { isStatic: true, friction: 0.4 },
      );
      const left = Bodies.rectangle(-WALL / 2, height / 2, WALL, height * 4, {
        isStatic: true,
      });
      const right = Bodies.rectangle(
        width + WALL / 2,
        height / 2,
        WALL,
        height * 4,
        { isStatic: true },
      );
      World.add(engine.world, [floor, left, right]);

      const shapes: ShapeBody[] = [];

      // Stagger the drops so the pile builds up rather than appearing
      // all at once. We use a `Bodies.rectangle` sized to match the
      // hamstouette's 2:1 bounding box — keeping the physics body as a
      // clean convex rectangle avoids the vertex-decomposition pitfalls
      // of `Bodies.fromVertices` (which needs the optional poly-decomp
      // lib) while still giving the silhouettes a satisfying landed
      // footprint. Visuals are painted via Path2D on top.
      const drops: ReturnType<typeof setTimeout>[] = [];
      for (let i = 0; i < COUNT; i++) {
        const t = setTimeout(() => {
          if (cancelled) return;
          // Width drives overall scale. Heights are derived from the
          // hamstouette aspect ratio so the body and the painted
          // silhouette always agree.
          const bodyWidth = 72 + Math.random() * 80;
          const bodyHeight = bodyWidth / HAMSTR_ASPECT;
          const x = 60 + Math.random() * Math.max(60, width - 120);
          const y = -bodyHeight * 2 - Math.random() * 200;
          const body = Bodies.rectangle(x, y, bodyWidth, bodyHeight, {
            restitution: 0.55,
            friction: 0.05,
            frictionAir: 0.012,
            density: 0.0018,
            // Start angled so flats land naturally and the pile reads as
            // "rotated tiles" rather than perfectly aligned bricks.
            angle: (Math.random() - 0.5) * 0.6,
          }) as ShapeBody;
          body._color = COLORS[i % COLORS.length];
          body._width = bodyWidth;
          body._height = bodyHeight;
          Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
          World.add(engine.world, body);
          shapes.push(body);
        }, 70 * i);
        drops.push(t);
      }

      // --- Drag (PointerEvents — mouse + touch + pen, all browsers) ---------
      // We deliberately avoid Matter's `Mouse` + `MouseConstraint` because
      // they rely on a brittle DPR/offset calculation that breaks on retina,
      // page zoom, and monitor changes. Native pointer events + a manual
      // velocity-target approach is far more reliable.
      let dragBody: ShapeBody | null = null;
      let dragOffsetX = 0;
      let dragOffsetY = 0;
      let pointerX = 0;
      let pointerY = 0;
      let lastCursor = "";

      const setCursor = (next: string) => {
        if (lastCursor === next) return;
        lastCursor = next;
        canvas.style.cursor = next;
      };
      setCursor("grab");

      const localPos = (clientX: number, clientY: number) => {
        const rect = canvas.getBoundingClientRect();
        // Hit-test is in CSS pixels — the same coordinate space the physics
        // world lives in (because we apply `setTransform(dpr,...)` to ctx).
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const hitTest = (px: number, py: number): ShapeBody | null => {
        // Iterate newest first so freshly dropped pieces (visually on
        // top) grab priority, mirroring stacking order. For rotated
        // rectangles we transform the pointer into the body's local
        // frame and hit-test against the unrotated AABB (with a few
        // pixels of slop for forgiving grabs).
        const SLOP = 4;
        for (let i = shapes.length - 1; i >= 0; i--) {
          const b = shapes[i];
          const dx = px - b.position.x;
          const dy = py - b.position.y;
          const cos = Math.cos(-b.angle);
          const sin = Math.sin(-b.angle);
          const lx = dx * cos - dy * sin;
          const ly = dx * sin + dy * cos;
          const halfW = (b._width || 80) / 2 + SLOP;
          const halfH = (b._height || 40) / 2 + SLOP;
          if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) return b;
        }
        return null;
      };

      const onPointerDown = (e: PointerEvent) => {
        const { x, y } = localPos(e.clientX, e.clientY);
        const body = hitTest(x, y);
        if (!body) return;
        e.preventDefault();
        dragBody = body;
        dragOffsetX = x - body.position.x;
        dragOffsetY = y - body.position.y;
        pointerX = x;
        pointerY = y;
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          // Some older Safari versions throw on pointer capture; not fatal.
        }
        // Wake the body up and let it move freely while we drag it.
        Body.setStatic(body, false);
        setCursor("grabbing");
      };

      const onPointerMove = (e: PointerEvent) => {
        const { x, y } = localPos(e.clientX, e.clientY);
        pointerX = x;
        pointerY = y;
        if (!dragBody) {
          setCursor(hitTest(x, y) ? "grab" : "default");
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (canvas.hasPointerCapture(e.pointerId)) {
          try {
            canvas.releasePointerCapture(e.pointerId);
          } catch {
            // ignore
          }
        }
        if (!dragBody) return;
        dragBody = null;
        setCursor("default");
      };

      const onPointerLeave = () => {
        if (!dragBody) setCursor("default");
      };

      // --- Self-righting (Weeble) torque -----------------------------------
      // The hamstouette silhouette has a clear "up" (back on top, feet
      // down), so we gently nudge each body back toward angle=0 every
      // tick. The spring is weak and paired with mild angular damping:
      // during an active flick the body still spins dramatically; once
      // it slows down, the restoring torque wins and rotates feet-down
      // before the next rest. Skipped for the body currently being
      // dragged so we never fight the user's input.
      const RIGHTING_SPRING = 0.0035;
      const SPIN_DAMPING = 0.985;

      const normalizeAngle = (a: number) => {
        let n = a % (Math.PI * 2);
        if (n > Math.PI) n -= Math.PI * 2;
        else if (n < -Math.PI) n += Math.PI * 2;
        return n;
      };

      // Each physics tick: apply Weeble torque to settled bodies, and —
      // if the user is dragging — drive the dragged body's velocity
      // toward the pointer target. Velocity-based dragging gives a
      // satisfying "throw on release" for free, because when we clear
      // dragBody the last computed velocity is preserved.
      Events.on(engine, "beforeUpdate", () => {
        for (const b of shapes) {
          if (b === dragBody) continue;
          const offset = normalizeAngle(b.angle);
          const nextAngVel =
            b.angularVelocity * SPIN_DAMPING - offset * RIGHTING_SPRING;
          Body.setAngularVelocity(b, nextAngVel);
        }

        if (!dragBody) return;
        const targetX = pointerX - dragOffsetX;
        const targetY = pointerY - dragOffsetY;
        const dx = targetX - dragBody.position.x;
        const dy = targetY - dragBody.position.y;
        // Cap the per-tick velocity so frantic flicks can't punch bodies
        // through walls or generate NaN states.
        const vx = Math.max(-60, Math.min(60, dx * 0.5));
        const vy = Math.max(-60, Math.min(60, dy * 0.5));
        Body.setVelocity(dragBody, { x: vx, y: vy });
        Body.setAngularVelocity(dragBody, dragBody.angularVelocity * 0.8);
      });

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerLeave);

      // --- Idle wiggle ------------------------------------------------------
      // Every ~1.5s, give one of the most-settled silhouettes an upward
      // "hop" so there's always a little life in the pile. Skipped while
      // the user is dragging so we never fight their input.
      const wiggle = window.setInterval(() => {
        if (dragBody || shapes.length === 0) return;
        const settled = shapes.filter(
          (b) => Math.hypot(b.velocity.x, b.velocity.y) < 0.6,
        );
        if (settled.length === 0) return;
        const pick = settled[Math.floor(Math.random() * settled.length)];
        Body.setVelocity(pick, {
          x: (Math.random() - 0.5) * 1.6,
          y: -(5 + Math.random() * 4),
        });
        Body.setAngularVelocity(pick, (Math.random() - 0.5) * 0.22);
      }, 1500);

      // --- Render loop ------------------------------------------------------
      // Build the silhouette once. Path2D is supported everywhere we
      // care about; if construction fails for some reason we fall back
      // to a simple filled rectangle so the footer never looks broken.
      let hamstrPath: Path2D | null = null;
      try {
        hamstrPath = new Path2D(HAMSTR_PATH_D);
      } catch {
        hamstrPath = null;
      }

      let raf = 0;
      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        for (const b of shapes) {
          // Defensive: a NaN/Infinity slipping through would throw inside
          // canvas2d. Skip and let physics correct itself.
          if (
            !Number.isFinite(b.position.x) ||
            !Number.isFinite(b.position.y) ||
            !Number.isFinite(b.angle)
          ) {
            continue;
          }
          const w = b._width || 80;
          const h = b._height || w / HAMSTR_ASPECT;
          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);
          ctx.fillStyle = b._color || "#fff";
          if (hamstrPath) {
            // Paint the silhouette in its native viewBox coords and
            // scale so the bounding box matches the physics body.
            const scale = w / HAMSTR_VB_W;
            ctx.scale(scale, scale);
            ctx.translate(-HAMSTR_VB_W / 2, -HAMSTR_VB_H / 2);
            ctx.fill(hamstrPath);
          } else {
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }
          ctx.restore();
        }
        raf = requestAnimationFrame(draw);
      };

      const runner = Runner.create();
      Runner.run(runner, engine);
      raf = requestAnimationFrame(draw);

      // --- Resize handling --------------------------------------------------
      // ResizeObserver fires for any container size change (font swap, image
      // load, viewport resize). We also re-check DPR — important when a user
      // drags the window between a retina laptop and a non-retina monitor.
      const handleResize = () => {
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        const newDpr = Math.max(1, window.devicePixelRatio || 1);
        if (newW === width && newH === height && newDpr === dpr) return;
        width = newW;
        height = newH;
        dpr = newDpr;
        sizeCanvas();
        Body.setPosition(floor, {
          x: width / 2,
          y: height + WALL / 2,
        });
        Body.setPosition(left, { x: -WALL / 2, y: height / 2 });
        Body.setPosition(right, {
          x: width + WALL / 2,
          y: height / 2,
        });
      };
      const ro = new ResizeObserver(handleResize);
      ro.observe(container);
      // DPR can change without container resize (zoom level, window dragged
      // to a different-density monitor). matchMedia fires on any change.
      const dprQuery = window.matchMedia(`(resolution: ${dpr}dppx)`);
      const onDprChange = () => handleResize();
      dprQuery.addEventListener("change", onDprChange);

      cleanup = () => {
        drops.forEach(clearTimeout);
        cancelAnimationFrame(raf);
        window.clearInterval(wiggle);
        ro.disconnect();
        dprQuery.removeEventListener("change", onDprChange);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        Runner.stop(runner);
        World.clear(engine.world, false);
        Engine.clear(engine);
      };
    };

    // Lazy init: don't spin up Matter or the RAF loop until the footer
    // actually scrolls into view. Saves CPU on long pages.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void init();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (cleanup) {
        cleanup();
        cleanup = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-auto absolute inset-0 z-20"
      // touch-action:none lets us own the gesture on touchscreens (otherwise
      // the browser captures the drag as a vertical scroll on first move).
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          touchAction: "none",
        }}
      />
    </div>
  );
}
