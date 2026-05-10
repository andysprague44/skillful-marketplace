"""FastAPI application entrypoint for the Hamstr rehoming marketplace."""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import hamsters

settings = get_settings()

app = FastAPI(
    title="Hamstr API",
    version="0.1.0",
    description="A gentle marketplace for rehoming hamsters with care.",
)

_cors_kwargs: dict[str, object] = {
    "allow_origins": settings.cors_origins_list,
    "allow_credentials": False,
    "allow_methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    "allow_headers": ["*"],
}
if settings.cors_allow_origin_regex and settings.cors_allow_origin_regex.strip():
    _cors_kwargs["allow_origin_regex"] = settings.cors_allow_origin_regex.strip()

app.add_middleware(CORSMiddleware, **_cors_kwargs)

app.include_router(hamsters.router)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    """Liveness probe used by deployment targets and smoke tests."""
    return {"status": "ok"}
