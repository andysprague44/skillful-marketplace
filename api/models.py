"""Pydantic models for the CRUD demo API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

UserRole = Literal["buyer", "seller"]
ListingCondition = Literal["new", "used"]


class UserBase(BaseModel):
    email: str
    full_name: str
    favorite_pokemon: str
    role: UserRole


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class UserCreate(UserBase):
    pass


class ListingBase(BaseModel):
    name: str
    price: float = Field(ge=0)
    condition: ListingCondition
    user_id: int


class Listing(ListingBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class ListingCreate(BaseModel):
    name: str
    price: float = Field(ge=0)
    condition: ListingCondition


class ListingUpdate(BaseModel):
    name: str | None = None
    price: float | None = Field(default=None, ge=0)
    condition: ListingCondition | None = None
