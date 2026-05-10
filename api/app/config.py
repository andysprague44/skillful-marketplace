"""Application configuration loaded from environment variables.

Uses ``pydantic-settings`` to read a local ``.env`` file (if present) and
environment variables for twelve-factor style configuration.
"""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime settings for the API service.

    Attributes:
        database_url: SQLAlchemy-compatible PostgreSQL URL.
        cors_allow_origins: Comma-separated list of allowed web origins.
        api_host: Host interface uvicorn binds to.
        api_port: Port uvicorn listens on.
    """

    database_url: str = (
        "postgresql+psycopg://hamstr_app:hamstr_app@localhost:5432/hamstr_marketplace"
    )
    cors_allow_origins: str = "http://localhost:3000"
    # Optional regex for ``Access-Control-Allow-Origin`` (e.g. all
    # ``*.vercel.app`` preview URLs). Env: ``CORS_ALLOW_ORIGIN_REGEX``.
    cors_allow_origin_regex: str | None = None
    api_host: str = "127.0.0.1"
    api_port: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a cleaned list of non-empty strings."""
        return [o.strip() for o in self.cors_allow_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached ``Settings`` instance for the process lifetime."""
    return Settings()
