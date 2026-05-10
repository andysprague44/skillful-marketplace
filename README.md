# Skillful Marketplace

This repo is a starter pack for a non-engineer who wants to use Cursor to build a full-stack application, e.g. a marketplace app.

## Getting Started

![Fork this repo](images/fork-me.png)

0. Install git & install Cursor

1. Fork this repo (↗️) to your own GitHub

2. From your own repo, copy the Clone URL (↗️)

3. Open a terminal (on Mac: Cmd + Space and type 'Terminal') and run:
```bash
mkdir ~/Dev
cd ~/Dev
git clone <url>
```

4. Open Cursor and open the repo (File → Open Folder)

5. Try out your first cursor command! In the chat type "/" then start to type the word t.e.a.c.h, press enter to get the command `teach-me`, then ask any question that comes to mind. Example:
    - `/teach-me what are the cursor commands in this repo?`

6. Build! Example:
    - `/plan I want to build a beautiful marketplace to sell my <really cool t-shirts|hamsters|artwork|surf boards|shoes and/or AI data infrastructure>`

---

## Running Hamstr

This repo currently contains **Hamstr**, a gentle, story-driven marketplace for rehoming hamsters.

- `web/` — Next.js App Router + TypeScript + Tailwind
- `api/` — Python FastAPI + SQLAlchemy + Alembic
- PostgreSQL running locally via Homebrew (no Docker)

### 1. One-time setup (macOS)

```bash
# Toolchain
brew install python@3.12 node postgresql@16
brew services start postgresql@16

# Database + app role
psql postgres <<'SQL'
CREATE ROLE hamstr_app WITH LOGIN PASSWORD 'hamstr_app';
CREATE DATABASE hamstr_marketplace OWNER hamstr_app;
GRANT ALL PRIVILEGES ON DATABASE hamstr_marketplace TO hamstr_app;
SQL

# API: venv + deps + migrations + sample data
cd api
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python scripts/seed.py
deactivate
cd ..

# Web: deps
cd web
npm install
cp .env.example .env.local 2>/dev/null || true
cd ..
```

> **Migrating from the old `bicycles_marketplace` DB?** Drop it with
> `dropdb bicycles_marketplace && dropuser bicycles_app` (or skip — it
> just sits unused) before running the `psql` block above.

### 2. Run locally (two terminals)

Terminal 1 — API (http://127.0.0.1:8000):

```bash
cd api
source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Terminal 2 — Web (http://localhost:3000):

```bash
cd web
npm run dev
```

### 3. Smoke test

```bash
curl http://127.0.0.1:8000/health             # -> {"status":"ok"}
curl http://127.0.0.1:8000/hamsters | head    # -> JSON array of hamsters
open http://localhost:3000                    # home page should render the seeded hamsters
```

### Environment variables

Both apps read config from `.env` files (already committed as `.env.example`):

| File | Purpose |
| --- | --- |
| `api/.env` | `DATABASE_URL`, `POSTGRES_*`, `CORS_ALLOW_ORIGINS`, optional `CORS_ALLOW_ORIGIN_REGEX`, `API_HOST`, `API_PORT` |
| `web/.env.local` | `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`) |

### Vercel + hosted API (when the site is live but data does not load)

1. In Vercel → your project → **Settings → Environment Variables**, set **`NEXT_PUBLIC_API_BASE_URL`** to your public API URL (HTTPS, **no trailing slash**), e.g. `https://your-service.up.railway.app`.
2. **Redeploy** after adding or changing that variable. `NEXT_PUBLIC_*` values are baked in at **`next build`**; an old deploy will keep calling `127.0.0.1:8000` until you rebuild.
3. On the API host, set **`CORS_ALLOW_ORIGINS`** to your real web origin(s), e.g. `https://your-app.vercel.app` (comma-separated if several). For many Vercel preview URLs you can set **`CORS_ALLOW_ORIGIN_REGEX`** to `https://.*\.vercel\.app` (see `api/.env.example`).
4. From your laptop: `curl https://<your-api>/health` should return `{"status":"ok"}`.

### Railway (FastAPI in `api/`)

Railway’s **Railpack** auto-detector only looks at the **repository root**. In a monorepo it then sees `web/` + `api/` and **cannot decide** what to build → *“Railpack could not determine how to build the app.”*

This repo fixes that with a **root `railway.toml`** that builds **`api/Dockerfile`**, so you do **not** have to set a Root Directory in the dashboard (you still can set it to `api` if you prefer Nixpacks there, but Docker from root is simpler).

1. **Variables** on the API service: `DATABASE_URL` (Supabase `postgresql+psycopg://…`), `CORS_ALLOW_ORIGINS`, optional `CORS_ALLOW_ORIGIN_REGEX` — see `api/.env.example`.
2. **Networking**: generate a public URL; smoke-test `GET /health`.
3. If you **remove** the root `railway.toml`, set **Service → Settings → Root Directory** to **`api`** and use **`uvicorn app.main:app --host 0.0.0.0 --port $PORT`** as the start command so Railpack sees `requirements.txt`.

If a deploy fails, copy the **Build Logs** error from Railway (not GitHub).
