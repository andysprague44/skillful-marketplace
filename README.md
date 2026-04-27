# Skillful Marketplace

This repo is a starter pack for a non-engineer, who wants to use cursor to build a full-stack application, e.g. a marketplace app.

## Getting Started

![Fork this repo](images/fork-me.png)

0. Install git & install cursor

1. Fork this repo (↗️) to your own github

2. From your own repo, copy the Clone URL (↗️)

3. Open a terminal (on mac: Cmd + Space and type 'Terminal') and run:
```bash
mkdir ~/Dev
cd ~/Dev
git clone <url>
```

4. Open cursor and open the repo (File -> Open Folder)

5. Try out your first cursor command! In the chat type "/" then start to type the word t.e.a.c.h, press enter to get the command `teach-me`, then ask any question that comes to mind. Example:
    - `/teach-me what are the cursor commands in this repo?`

5. Build! example:
    - `/plan I want to build a beautiful marketplace to sell my <really cool t-shirts|hamsters|artwork|surf boards|shoes and/or AI data infrastructure`

## CRUD demo API (FastAPI)

A minimal in-memory API lives under `api/`. It includes users, listings, HTTP Basic auth, and [Swagger UI](http://localhost:8000/docs) at `/docs`.

### Setup and run (macOS / Linux)

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Open **http://localhost:8000/docs** — click **Authorize** and sign in with:

- **Username:** a demo user email, e.g. `alice@example.com`, `bob@example.com`, or `carol@example.com`
- **Password:** `password` (shared for the demo)

**Health check (no auth):** `GET http://localhost:8000/health`
