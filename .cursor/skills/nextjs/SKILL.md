---
name: nextjs
description: Conventions for the Next.js App Router + TypeScript web app in `web/`. Use when editing or adding pages, components, or API client code under `web/`.
---

# Next.js (App Router, TypeScript)

## Structure

- Pages live in `web/app/<route>/page.tsx` (server components by default).
- Client components must start with `"use client";` and are suffixed by intent, not `.client.tsx`.
- Shared UI goes in `web/components/`.
- The API client and shared types live in `web/lib/api.ts`. Import via `@/lib/api`.

## TypeScript

- `.ts` / `.tsx` only — never `.js` / `.jsx` in sources.
- Use `interface` for data shapes and `type` for unions/aliases.
- Keep components as named exports (`export function Foo`) unless Next.js requires a default (pages, layouts, `loading.tsx`, `error.tsx`, route handlers).

## Data fetching

- Prefer server components + `fetch(..., { cache: "no-store" })` for dynamic data.
- Read the API base from `process.env.NEXT_PUBLIC_API_BASE_URL`.
- Funnel all API calls through `web/lib/api.ts` — do not sprinkle `fetch("http://…")` across components.

## Styling

- Tailwind v4 (`@import "tailwindcss"` in `globals.css`) is the only styling system.
- See `tailwind-mobile-first` skill for breakpoint rules.

## Images

- v1 uses plain `<img>` tags to avoid remote-host allowlist config. Add `// eslint-disable-next-line @next/next/no-img-element` above each `<img>`.

## Build & lint

- `npm run dev`, `npm run build`, `npm run lint` from `web/`.
- `npm run build` must pass before completing any feature.
