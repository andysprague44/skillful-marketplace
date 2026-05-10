"""ORM models for the Hamstr rehoming marketplace."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Hamster(Base):
    """A hamster being rehomed by their current human.

    Adoption fees are stored as integer cents (a fee of 0 means
    "free to a good home"). Photos are referenced by URL; the v1 API
    does not host uploads itself. ``latitude``/``longitude`` are populated
    at seed time from a curated city → coordinate lookup so the listing
    can show on the map view; user-posted listings without a known city
    leave them ``NULL`` and simply don't appear on the map.
    """

    __tablename__ = "hamsters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    species: Mapped[str] = mapped_column(String(32), nullable=False)
    age_months: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gender: Mapped[str] = mapped_column(String(16), nullable=False, default="unknown")
    color: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    temperament: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    story: Mapped[str] = mapped_column(Text, nullable=False, default="")
    includes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    adoption_fee_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    location: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    current_human_name: Mapped[str] = mapped_column(String(120), nullable=False)
    current_human_email: Mapped[str] = mapped_column(String(254), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
