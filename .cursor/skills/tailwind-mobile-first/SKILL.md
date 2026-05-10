---
name: tailwind-mobile-first
description: Mobile-first Tailwind conventions for the web app. Use when adding or adjusting layout, spacing, or responsive styles in `web/`.
---

# Tailwind — mobile-first rules

## Base = mobile

- Author classes without a breakpoint prefix for the mobile layout.
- Add `sm:` / `md:` / `lg:` prefixes only to override the mobile baseline for larger screens.
- Never use a breakpoint-prefixed class without a matching unprefixed fallback.

## Layout primitives

- Page container: `mx-auto w-full max-w-3xl px-4`. Don't widen beyond `max-w-3xl` without a design reason.
- Vertical rhythm: `flex flex-col gap-3` / `gap-4` over ad-hoc `mt-*` / `mb-*` stacks.
- Grids: start `grid-cols-1`, bump to `sm:grid-cols-2` / `md:grid-cols-3` as density allows.

## Touch targets

- Interactive elements must be ≥ 44×44 CSS pixels (`py-2` + sensible horizontal padding, or explicit `h-11`).
- Primary actions: `rounded-lg bg-[color:var(--accent)] px-4 py-3 text-base font-semibold text-white`.
- Add `active:scale-[0.99]` (or similar) to buttons/cards to give tactile feedback.

## Safe areas & chrome

- Respect iOS safe areas on fixed bottom UI: `style={{ paddingBottom: "env(safe-area-inset-bottom)" }}`.
- Sticky headers: `sticky top-0 z-10` + a translucent `bg-[color:var(--surface)]/90 backdrop-blur` background.

## Theming

- Colors are driven by CSS variables defined in `app/globals.css` (`--background`, `--foreground`, `--accent`, `--muted`, `--surface`, `--border`).
- Reference them as `text-[color:var(--muted)]`, `bg-[color:var(--surface)]`, etc., so dark-mode tokens cascade automatically.
- Do not hardcode hex colors in components — add a variable instead.

## Typography

- Body: `text-base` (inputs included, to avoid iOS zoom on focus).
- Section titles: `text-2xl font-bold tracking-tight`.
- Secondary text: `text-sm text-[color:var(--muted)]`.
