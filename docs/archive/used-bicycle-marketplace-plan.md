# Used Bicycle Marketplace — Implementation Plan

**Overall Progress:** `100%`

## TLDR

Build a mobile-first online marketplace where users can browse, list, and contact sellers of used bicycles. Scaffolded as a Next.js + TypeScript web app, a Python FastAPI service, and a local PostgreSQL database — no Docker, macOS local dev only.

## Critical Decisions

- **Stack**: Next.js (App Router) + TypeScript, Python FastAPI, PostgreSQL via Homebrew — enforced by the `tech-stack` skill.
- **Mobile-first UI**: Tailwind CSS with mobile breakpoints as the default; desktop treated as progressive enhancement.
- **No auth in v1**: Listings include a seller name + contact email captured at creation; keeps scope minimal and defers real auth to a follow-up.
- **Image handling v1**: Store image URLs (string field) rather than hosting uploads; defer object storage/upload pipeline.
- **Schema migrations**: Alembic for version-controlled schema changes.
- **Search/filter v1**: Server-side filtering by brand, condition, price range, and location substring — no full-text search engine.
- **Monorepo layout**: `web/` + `api/` at the repo root, consistent with the tech-stack skill.

## Tasks

- [x] 🟩 **Step 1: Preflight & tooling checks**
  - [x] 🟩 Confirm repo root is safe to scaffold into (only `README.md`, `LICENSE`, `.git/`, `.gitignore`, `.cursor/`, `images/`, `docs/`)
  - [x] 🟩 Verify `node`, `npm`, `python3`, `pip`, `brew` are installed
  - [x] 🟩 Root `.gitignore` already covers Next.js, FastAPI, and `.venv/` entries

- [x] 🟩 **Step 2: Local PostgreSQL (Homebrew)**
  - [x] 🟩 Install/start `postgresql@16` via Homebrew
  - [x] 🟩 Create `bicycles_marketplace` database and `bicycles_app` role
  - [x] 🟩 Document `DATABASE_URL` and `POSTGRES_*` env vars (see `api/.env.example`)

- [x] 🟩 **Step 3: Scaffold API (`api/` — FastAPI)**
  - [x] 🟩 Create `api/.venv` (Python 3.12) and `requirements.txt`
  - [x] 🟩 FastAPI app skeleton with health endpoint `GET /health`
  - [x] 🟩 Settings module reading `DATABASE_URL` from env
  - [x] 🟩 SQLAlchemy engine/session wiring
  - [x] 🟩 Initialize Alembic and create baseline migration

- [x] 🟩 **Step 4: Core domain — Listings**
  - [x] 🟩 `Listing` model with all planned fields
  - [x] 🟩 Pydantic schemas (create/read)
  - [x] 🟩 Alembic migration for `listings` table applied
  - [x] 🟩 Endpoints: `GET /listings` (with filters), `GET /listings/{id}`, `POST /listings`
  - [x] 🟩 CORS config allowing the web app origin

- [x] 🟩 **Step 5: Scaffold Web App (`web/` — Next.js + TS + Tailwind)**
  - [x] 🟩 `create-next-app` with TypeScript, App Router, Tailwind, ESLint (no `src/` JS)
  - [x] 🟩 Mobile-first base layout, viewport meta, safe-area padding, sticky header, bottom nav
  - [x] 🟩 API client module reading `NEXT_PUBLIC_API_BASE_URL`

- [x] 🟩 **Step 6: Marketplace UI pages**
  - [x] 🟩 `/` Home — listing grid with search + filter form (brand, condition, price, location)
  - [x] 🟩 `/listings/[id]` Detail — photo, specs, description, seller contact reveal
  - [x] 🟩 `/sell` Create listing form with client-side validation
  - [x] 🟩 Empty/error/404 states on each page

- [x] 🟩 **Step 7: Cursor skills for new tech**
  - [x] 🟩 Added `.cursor/skills/nextjs/SKILL.md`
  - [x] 🟩 Added `.cursor/skills/fastapi/SKILL.md`
  - [x] 🟩 Added `.cursor/skills/tailwind-mobile-first/SKILL.md`

- [x] 🟩 **Step 8: Root README & run scripts**
  - [x] 🟩 Documented macOS setup: Postgres, venv, web install
  - [x] 🟩 Commands: start Postgres, run migrations, run API, run web
  - [x] 🟩 Smoke-test steps: `/health` returns 200, home page renders listings from API

- [x] 🟩 **Step 9: Verify & close out**
  - [x] 🟩 Seeded 5 sample bicycle listings (`api/scripts/seed.py`)
  - [x] 🟩 End-to-end smoke test: API `/health` 200, `/listings` returns 5, web `/`, `/listings/2`, `/sell` all 200
  - [x] 🟩 `tech-stack` validation checklist items pass (no Docker, venv, TS only, Alembic, `DATABASE_URL`)
