"""Pydantic schemas for request and response payloads."""

from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Species(str, Enum):
    """Common pet hamster species. ``OTHER`` covers anything not listed."""

    MUNCHKIN = "munchkin"
    DWARF_WINTER_WHITE = "dwarf_winter_white"
    DWARF_CAMPBELL = "dwarf_campbell"
    ROBOROVSKI = "roborovski"
    CHINESE = "chinese"
    OTHER = "other"


class Gender(str, Enum):
    """Hamster gender; ``UNKNOWN`` is allowed for cases where it isn't known."""

    FEMALE = "female"
    MALE = "male"
    UNKNOWN = "unknown"


class HamsterBase(BaseModel):
    """Fields shared between create and read schemas."""

    name: str = Field(min_length=1, max_length=80)
    species: Species
    age_months: int = Field(ge=0, le=60, default=0)
    gender: Gender = Gender.UNKNOWN
    color: str = Field(default="", max_length=64)
    temperament: str = Field(default="", max_length=120)
    story: str = Field(default="", max_length=5000)
    includes: str = Field(default="", max_length=2000)
    adoption_fee_cents: int = Field(ge=0, le=10_000_000, default=0)
    location: str = Field(default="", max_length=120)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    photo_url: str = Field(default="", max_length=500)


class HamsterCreate(HamsterBase):
    """Payload accepted by ``POST /hamsters``."""

    current_human_name: str = Field(min_length=1, max_length=120)
    current_human_email: EmailStr


class HamsterRead(HamsterBase):
    """Representation returned from hamster endpoints."""

    id: int
    current_human_name: str
    current_human_email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
