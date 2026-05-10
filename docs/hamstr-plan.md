# Hamstr — Implementation Plan

**Overall Progress:** `0%`

## TLDR

Transform the existing bicycle marketplace skeleton (`web/` Next.js + `api/` FastAPI + local Postgres) into **Hamstr**, a warm, story-driven marketplace for rehoming hamsters. The site should feel like a small, cared-for thing — playful colors from the logo, soft motion, micro-interactions, an interactive cursor-following hamster on the home page, and copy that treats every listing as a little life finding a soft landing.

## Critical Decisions

- **Reuse the stack, not the schema**: keep Next.js + FastAPI + Postgres, but replace `listings` (bicycle-shaped) with a new `hamsters` table tailored to rehoming. New Alembic migration; no attempt to migrate existing rows.
- **"Listings" → "Hamsters"** end-to-end (routes, components, API). Old bicycle code is removed, not preserved behind flags — keeps the codebase small and honest.
- **No real auth / no payments in v1**: a listing captures the current human's name + email + a written story. "Adoption fee" replaces "price"; $0 is allowed and encouraged.
- **Aesthetic direction — Tesoro-style "color-block storytelling"** (reference: tesoroxp.com). Specifically:
  - Full-bleed, saturated **section colors** that change as you scroll (cream → peach → mint/teal → soft pink → mustard), pulled directly from the logo palette. No white "page chrome".
  - **Oversized, heavy, slightly-rounded display type** for headlines and the brand mark; clean readable body font underneath.
  - **Floating "sticker" chips** (small pill labels with subtle drop shadow) layered over imagery — e.g. "FOR THE / NEW HUMAN", "Their story", hamster name tags.
  - **Octagon photo frames** for hamster portraits and people shots — distinctive and on-brand vs. generic circles/rounded rects.
  - **Color-coded step tiles** in a row for process explainers (e.g. on `/about` or a "How rehoming works" strip), each tile its own bold logo color.
  - **Big dark pill CTAs** with a circular icon on the right (e.g. "MEET THE HAMSTERS ▶").
  - **Numbered tab indicators** (1 · 2 · 3) for the multi-section rehome form in Step 7.
- **Brand system in CSS variables**: encode the 5-color logo palette + a cream `--bg` and a near-black `--ink` in `globals.css`. Each section sets its own `--bg` so child components stay color-token-driven.
- **Motion stack — match Tesoro's quality bar**: use the same proven combo (confirmed from inspecting tesoroxp.com source):
  - **Lenis** for smooth/inertial scroll (the "buttery" page feel).
  - **GSAP** + **ScrollTrigger** for scroll-driven section transitions (color swaps, sticky cards, parallax).
  - **GSAP SplitText** for character-level headline reveals (e.g. the hero tagline letters animating in one-by-one).
  - **Matter.js** for the playful **footer "drop"** of physical hamster-themed shapes (see Step 11).
  - All motion gated on `prefers-reduced-motion: no-preference`; physics canvas only initialized when it scrolls into view via `IntersectionObserver`.
  - Loaded as Next.js client components; libraries `import`-ed in only the components that use them, so SSR pages stay fast.
- **Cursor-follower hamster**: a single client component on the home page only, using `requestAnimationFrame` + spring easing. Pauses when the tab is hidden, hides on touch devices, and disables under `prefers-reduced-motion`.
- **Logo asset**: the uploaded `hamstr` logo lives at `web/public/hamstr-logo.svg` (or `.png`) and is used in the header, favicon, and OG image.
- **Storytelling pages, not marketing fluff**: a real `/about` page with the Beatrice origin story and a short founder letter on the homepage. No fake testimonials, no stock e-commerce tropes.
- **Mobile-first stays**: existing Tailwind mobile-first conventions and bottom nav are preserved; delight is additive, not at the cost of layout.

## Tasks

- [ ] 🟥 **Step 1: Brand foundation**
  - [ ] 🟥 Save uploaded logo to `web/public/hamstr-logo.svg` (or `.png`) and use as favicon
  - [ ] 🟥 Define palette + type scale in `web/app/globals.css` as CSS variables: `--teal`, `--mustard`, `--peach`, `--coral`, `--pink`, `--cream` (page bg), `--ink` (near-black text); plus a section-bg variable so sections can swap their own color
  - [ ] 🟥 Pick a friendly heavy display font (e.g. Recoleta, Bricolage Grotesque, or Fraunces 900) + a clean body font (e.g. Inter or Manrope) via `next/font`; wire in `layout.tsx`
  - [ ] 🟥 Add reusable primitives in `web/components/ui/`: `Sticker` (pill chip with shadow), `Octagon` (CSS clip-path frame for images), `PillCTA` (dark pill button with right-side circular icon), `SectionBlock` (full-bleed colored section wrapper)
  - [ ] 🟥 Update `<head>` metadata: title "Hamstr — soft landings for small lives", description, OG tags

- [ ] 🟥 **Step 2: Domain reshape (API)**
  - [ ] 🟥 Replace `Listing` model with `Hamster`: `name`, `species` (Munchkin/Dwarf/Roborovski/Chinese/Other), `age_months`, `gender`, `color`, `temperament` (shy/curious/cuddly/spicy/...), `story` (long text), `includes` (cage/wheel/food notes), `adoption_fee_cents` (default 0), `location`, `photo_url`, `current_human_name`, `current_human_email`, `created_at`
  - [ ] 🟥 New Alembic migration: drop `listings`, create `hamsters`
  - [ ] 🟥 Rewrite `routers/listings.py` → `routers/hamsters.py` with `GET /hamsters` (filters: species, gender, location, max_fee), `GET /hamsters/{id}`, `POST /hamsters`
  - [ ] 🟥 Update `api/scripts/seed.py` with 6–8 hand-written hamster stories (including a nod to Beatrice)

- [ ] 🟥 **Step 3: Web data layer**
  - [ ] 🟥 Rewrite `web/lib/api.ts` types and fetchers for `Hamster` / `HamsterFilters`
  - [ ] 🟥 Add small helpers: `formatFee` ("Free to a good home" when $0), `formatAge` ("4 months · pup")

- [ ] 🟥 **Step 4: Delight primitives (shared)**
  - [ ] 🟥 Add deps: `gsap`, `lenis`, `matter-js` (+ `@types/matter-js`); GSAP SplitText + ScrollTrigger are bundled with `gsap` (the free build covers both)
  - [ ] 🟥 `web/components/SmoothScroll.tsx`: client component that initializes Lenis once on mount; exposes a module-level `lenis` instance for other components to call `.start()` / `.stop()`; wired in `app/layout.tsx`
  - [ ] 🟥 `web/lib/gsap.ts`: single registration point for `gsap.registerPlugin(ScrollTrigger, SplitText)`; exports a `useReducedMotion()` hook
  - [ ] 🟥 `web/components/motion/`: tiny client wrappers — `<RevealChars>` (SplitText char stagger), `<RevealUp>` (ScrollTrigger fade-up), `<StickyColorSection>` (full-bleed section that swaps `--bg` and stays sticky while content scrolls within)
  - [ ] 🟥 `web/components/HamstrLogo.tsx`: SVG/Image logo with a gentle GSAP hover wiggle
  - [ ] 🟥 `web/components/StaggerHoverLink.tsx` — nav link primitive that on hover sweeps a wave of color through individual characters (Tesoro recipe: `SplitText` chars + `gsap.timeline` with `stagger: { each: 0.02, from: 'start' }`, `duration: 0.15`, `ease: 'none'`; in→out color sweep on enter, smooth return on leave). Wrapped in `gsap.matchMedia('(hover: hover) and (pointer: fine)')` so touch devices get a static fallback. Reduced-motion fallback: instant color change, no stagger. Optional child `[data-nav-link-underline]` slides up from `yPercent: 100` on enter as an animated underline.
  - [ ] 🟥 Header + bottom nav use `StaggerHoverLink` for every nav item; soft active-tab indicator that follows the cursor (GSAP `quickTo`)
  - [ ] 🟥 `web/components/PageTransition.tsx` — full-screen "curtain" wipe between routes (Tesoro recipe):
    - Markup: a fixed-position wrapper containing a colored background shape (octagon clip-path) and the Hamstr logo
    - **On mount / route load**: curtain starts covering viewport, then clip-paths upward off-screen with `expo.out` (0.6s), revealing the new page; logo fades up and out
    - **On internal link click** (intercept anchor clicks where `hostname === location.host`, skip `target=_blank`/hash links): `lenis.stop()`, show curtain, octagon shape pops in (`scale: 0 → 0.5`, `rotate: -60 → 0`, `back.out(1.4)`, 0.5s) then expands to fill viewport, logo fades in from below, then `router.push(href)` (Next.js App Router) on timeline complete
    - Hooks into Next.js `<Link>` clicks via a single delegated listener on `document`
    - Skipped entirely under `prefers-reduced-motion`; `<Link>` navigates normally
    - Wired in `app/layout.tsx` once

- [ ] 🟥 **Step 5: Home page (`/`) — color-block scroll**
  - [ ] 🟥 Section A (`--cream`): oversized logo + tagline animated in via `<RevealChars>` (SplitText char-by-char); floating "sticker" chips drifting nearby ("rehome with care", "soft landings", a hamster-name tag); CTA pair as `PillCTA` ("MEET THE HAMSTERS ▶" / "REHOME YOURS")
  - [ ] 🟥 `web/components/CursorHamster.tsx`: cursor-following hamster using GSAP `quickTo` with `power3` easing (matches Tesoro's cursor follower technique); hidden on touch and under reduced motion; pauses when tab hidden; constrained to the hero section
  - [ ] 🟥 Section B (`--peach`): short founder letter from Greg, with an octagon-framed photo (placeholder OK) and a small "FOR THE / NEW HUMAN" sticker tab above the heading; ScrollTrigger fade-up
  - [ ] 🟥 Section C (`--mint/teal`): hamster grid using new `HamsterCard` (octagon photo, big name, species chip, age, location, fee or "Free"); cards lift + shadow on hover, ScrollTrigger stagger on enter
  - [ ] 🟥 Filter bar restyled as soft pill chips (species, gender, location, max fee); animated "Apply" as a dark `PillCTA`
  - [ ] 🟥 Section D (`--mustard`): "How rehoming works" — 4 color-coded step tiles in a row (peach / mustard / mint / pink), each with a short label (Tell their story · Find a match · Meet up · Soft landing); tiles pop in with a sticky-pin ScrollTrigger
  - [ ] 🟥 Tasteful empty state for the grid: dashed octagon outline + copy "No hamsters here yet. Maybe yours is the first?"

- [ ] 🟥 **Step 6: Hamster detail page (`/hamsters/[id]`)**
  - [ ] 🟥 Section bg derived from species (each species gets one of the palette colors) so every hamster page has its own mood
  - [ ] 🟥 Two-column on desktop, stacked on mobile: octagon-framed photo + name/age/species/location panel; species shown as a `Sticker` chip
  - [ ] 🟥 "Their story" long-form section (preserves line breaks) on a contrasting cream sub-block
  - [ ] 🟥 "Comes with" includes list as a row of small color tiles
  - [ ] 🟥 Reveal-on-tap contact panel (reuse existing `ContactSellerToggle` pattern, renamed to `ContactCurrentHumanToggle`) with a soft bounce on reveal
  - [ ] 🟥 Sticky `PillCTA` on mobile: "I'd like to meet {name} ▶"

- [ ] 🟥 **Step 7: List-a-hamster page (`/rehome`)** (replaces `/sell`)
  - [ ] 🟥 Numbered tab indicators (1 · 2 · 3 · 4) at the top of the form, Tesoro-style; sections: your hamster → their personality → their story → about you
  - [ ] 🟥 One section visible at a time with smooth transitions; section background tints shift with each step (peach → mint → pink → cream); full form still submits in one request
  - [ ] 🟥 Friendly inline validation (no red walls of error); validation messages styled as small `Sticker` chips
  - [ ] 🟥 Success state: confetti-light animation + "Thank you for giving them a soft landing" on a saturated section bg

- [ ] 🟥 **Step 8: About page (`/about`) — color-block scroll**
  - [ ] 🟥 Section A (`--peach`): "The Hamstr Origin Story" headline in display type, with octagon-framed photo of Beatrice (placeholder OK)
  - [ ] 🟥 Section B (`--cream`): full origin story (verbatim from the brief, lightly formatted) with pull-quote stickers
  - [ ] 🟥 Section C (`--teal`): the four stats as 4 color-coded tiles in a row, with count-up on scroll into view
  - [ ] 🟥 Section D (`--mustard`): Greg's one-liner bio with octagon photo
  - [ ] 🟥 Subtle easter-egg hover on the logo's hidden Beatrice silhouette ("if you know where to look")

- [ ] 🟥 **Step 9: Footer — physics "drop"** (the hero animation)
  - [ ] 🟥 `web/components/HamstrFooter.tsx`: full-bleed teal footer with site nav, mailing-list field, social links
  - [ ] 🟥 `web/components/FallingHamstrShapes.tsx` client component: Matter.js canvas pinned to the footer
    - Engine `gravity.y = 2`, restitution `0.75` (bouncy but not rubbery) — same params as Tesoro
    - 4 static walls (left/right/floor/ceiling) so shapes can't escape; ceiling sits above the canvas so shapes drop in from "above"
    - 12–16 SVG shapes drop in on a 100ms staggered timer
    - Shape textures (SVGs in `web/public/shapes/`): the six logo letters (`h`, `a`, `m`, `s`, `t`, `r`) each in their own logo color, plus a sunflower seed, a heart, a star, and a tiny Beatrice silhouette — all rounded-rectangle bodies with a `chamfer` for the bouncy look
    - `MouseConstraint` so users can grab and fling shapes (with the Tesoro-style touch-event rebinding so it still works on mobile but doesn't block scroll)
    - `IntersectionObserver` (threshold 0.1) — only initialize when footer enters viewport
    - Skip entirely under `prefers-reduced-motion`; render a static row of the same shapes instead
  - [ ] 🟥 Wire the footer into `app/layout.tsx` so it appears site-wide
  - [ ] 🟥 ScrollTrigger to flip nav theme to dark when the footer scrolls into view (Tesoro does this; reads beautifully)

- [ ] 🟥 **Step 10: Cleanup & polish**
  - [ ] 🟥 Delete unused bicycle code/components/types/seed
  - [ ] 🟥 Update root `README.md`: rename to Hamstr, swap DB name suggestion (or keep `bicycles_marketplace` and just note it), update smoke-test URLs to `/hamsters`
  - [ ] 🟥 Update `docs/used-bicycle-marketplace-plan.md` reference or archive it
  - [ ] 🟥 Lighthouse pass on mobile: animations don't tank LCP/CLS; reduced-motion verified; Matter.js canvas only loads when in view

- [ ] 🟥 **Step 11: Smoke test**
  - [ ] 🟥 `GET /health` 200, `GET /hamsters` returns seeded rows
  - [ ] 🟥 Home, `/hamsters/[id]`, `/rehome`, `/about` all render
  - [ ] 🟥 Cursor hamster visible on desktop, hidden on touch, hidden under reduced-motion
  - [ ] 🟥 Footer shapes drop and are draggable on desktop and touch; static fallback under reduced-motion
  - [ ] 🟥 Page-transition curtain plays on internal navigation; external links and reduced-motion bypass it; back-button works (cache-bust on `pageshow` if needed)
  - [ ] 🟥 Stagger-hover sweep visible on nav links over desktop hover; instant color on touch + reduced-motion
  - [ ] 🟥 Create a hamster end-to-end via the form; it appears on the home grid
