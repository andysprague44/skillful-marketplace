"""HTTP endpoints for hamster rehoming listings."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Hamster
from ..schemas import Gender, HamsterCreate, HamsterRead, Species

router = APIRouter(prefix="/hamsters", tags=["hamsters"])


def _apply_filters(
    stmt: Select[tuple[Hamster]],
    *,
    q: str | None,
    species: Species | None,
    gender: Gender | None,
    location: str | None,
    max_fee_cents: int | None,
) -> Select[tuple[Hamster]]:
    """Apply the standard browsing filters to a SQLAlchemy ``Select``.

    Extracted so the list and count endpoints stay in lock-step.
    """
    if q:
        stmt = stmt.where(Hamster.name.ilike(f"%{q}%"))
    if species is not None:
        stmt = stmt.where(Hamster.species == species.value)
    if gender is not None:
        stmt = stmt.where(Hamster.gender == gender.value)
    if location:
        stmt = stmt.where(Hamster.location.ilike(f"%{location}%"))
    if max_fee_cents is not None:
        stmt = stmt.where(Hamster.adoption_fee_cents <= max_fee_cents)
    return stmt


@router.get("", response_model=list[HamsterRead])
def list_hamsters(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None, description="Free-text name substring"),
    species: Species | None = Query(default=None),
    gender: Gender | None = Query(default=None),
    location: str | None = Query(default=None),
    max_fee_cents: int | None = Query(default=None, ge=0),
    limit: int = Query(default=24, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[Hamster]:
    """Return hamsters filtered by optional query parameters.

    Results are ordered by most-recently created first. Pair with the
    ``GET /hamsters/count`` endpoint for total-row pagination.
    """
    stmt = _apply_filters(
        select(Hamster),
        q=q,
        species=species,
        gender=gender,
        location=location,
        max_fee_cents=max_fee_cents,
    )
    stmt = stmt.order_by(Hamster.created_at.desc()).limit(limit).offset(offset)
    return list(db.execute(stmt).scalars().all())


@router.get("/map", response_model=list[HamsterRead])
def map_hamsters(
    db: Session = Depends(get_db),
    species: Species | None = Query(default=None),
    gender: Gender | None = Query(default=None),
    max_fee_cents: int | None = Query(default=None, ge=0),
    limit: int = Query(default=500, ge=1, le=2000),
) -> list[Hamster]:
    """Return all hamsters that have coordinates, for the map view.

    Skips listings without ``latitude``/``longitude`` so we don't send a
    bunch of pinless rows to the client. The map clusters on the client,
    so we deliberately allow a much larger ``limit`` than the list
    endpoint — but cap it so a malicious client can't ask for everything.
    """
    stmt = _apply_filters(
        select(Hamster),
        q=None,
        species=species,
        gender=gender,
        location=None,
        max_fee_cents=max_fee_cents,
    )
    stmt = stmt.where(Hamster.latitude.isnot(None)).where(Hamster.longitude.isnot(None))
    stmt = stmt.order_by(Hamster.created_at.desc()).limit(limit)
    return list(db.execute(stmt).scalars().all())


@router.get("/count", response_model=dict[str, int])
def count_hamsters(
    db: Session = Depends(get_db),
    q: str | None = Query(default=None),
    species: Species | None = Query(default=None),
    gender: Gender | None = Query(default=None),
    location: str | None = Query(default=None),
    max_fee_cents: int | None = Query(default=None, ge=0),
) -> dict[str, int]:
    """Return ``{"total": N}`` for the given filters; used for pagination UIs."""
    stmt = _apply_filters(
        select(func.count(Hamster.id)),
        q=q,
        species=species,
        gender=gender,
        location=location,
        max_fee_cents=max_fee_cents,
    )
    total = db.execute(stmt).scalar_one()
    return {"total": int(total)}


@router.get("/{hamster_id}", response_model=HamsterRead)
def get_hamster(hamster_id: int, db: Session = Depends(get_db)) -> Hamster:
    """Return a single hamster by id or raise 404 if not found."""
    hamster = db.get(Hamster, hamster_id)
    if hamster is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hamster not found")
    return hamster


@router.post("", response_model=HamsterRead, status_code=status.HTTP_201_CREATED)
def create_hamster(payload: HamsterCreate, db: Session = Depends(get_db)) -> Hamster:
    """Create and persist a new hamster listing, returning the stored record."""
    hamster = Hamster(
        name=payload.name,
        species=payload.species.value,
        age_months=payload.age_months,
        gender=payload.gender.value,
        color=payload.color,
        temperament=payload.temperament,
        story=payload.story,
        includes=payload.includes,
        adoption_fee_cents=payload.adoption_fee_cents,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        photo_url=payload.photo_url,
        current_human_name=payload.current_human_name,
        current_human_email=str(payload.current_human_email),
    )
    db.add(hamster)
    db.commit()
    db.refresh(hamster)
    return hamster
