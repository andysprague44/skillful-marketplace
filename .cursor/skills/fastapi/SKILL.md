---
name: fastapi
description: Conventions for the FastAPI service in `api/`. Use when editing or adding endpoints, models, schemas, or migrations under `api/`.
---

# FastAPI service

## Layout

```
api/
  app/
    __init__.py
    main.py          # FastAPI() + middleware + router include
    config.py        # pydantic-settings Settings
    database.py      # SQLAlchemy engine, SessionLocal, get_db, Base
    models.py        # SQLAlchemy ORM models
    schemas.py       # Pydantic request/response schemas
    routers/<resource>.py
  migrations/        # Alembic
  requirements.txt
  .env               # local-only, not committed
  .env.example       # committed template
  .venv/             # local-only, not committed
```

## Virtual environment (required)

```bash
cd api
python3 -m venv .venv          # use /opt/homebrew/bin/python3.12 if system python < 3.10
source .venv/bin/activate
pip install -r requirements.txt
```

Never `pip install` without the venv active. Never install deps globally.

## Running

```bash
source api/.venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Database & migrations

- Configuration comes from environment variables (`DATABASE_URL`, etc.) loaded via `Settings` in `app/config.py`.
- Schema changes are always Alembic migrations — never raw DDL, never SQLAlchemy `create_all` in app code.
- Create a migration with `alembic revision --autogenerate -m "<message>"`, review the generated file, then `alembic upgrade head`.

## Endpoints

- Declare routes on an `APIRouter(prefix="/<resource>", tags=["<resource>"])` in `app/routers/<resource>.py`.
- Use `response_model=` so OpenAPI stays accurate.
- Inject DB sessions via `Depends(get_db)`; never reach for `SessionLocal()` in handlers.
- Raise `HTTPException` with explicit `status_code` for error paths.

## Validation

- Pydantic schemas in `schemas.py` are the source of truth for shape + validation.
- Enums (e.g. `Condition`) live as `str, Enum` classes so they render as string enums in OpenAPI.

## CORS

- Allowed origins are driven by `CORS_ALLOW_ORIGINS` in `.env` (comma-separated) and applied in `main.py`.
