"""
FastAPI CRUD demo: in-memory users and listings, HTTP Basic auth, Swagger at /docs.
Shared password for all demo users: "password" (use email as username).
"""

from __future__ import annotations

import secrets
from collections.abc import Generator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from models import (
    Listing,
    ListingCreate,
    ListingUpdate,
    User,
)

DEMO_PASSWORD = "password"

# In-memory storage (re-seeded on each process start)
users: dict[int, User] = {}
listings: dict[int, Listing] = {}
next_user_id: int = 1
next_listing_id: int = 1

security = HTTPBasic()


def seed_data() -> None:
    global next_user_id, next_listing_id
    users.clear()
    listings.clear()
    next_user_id = 1
    next_listing_id = 1

    u1 = User(
        id=1,
        email="alice@example.com",
        full_name="Alice",
        favorite_pokemon="Pikachu",
        role="seller",
    )
    u2 = User(
        id=2,
        email="bob@example.com",
        full_name="Bob",
        favorite_pokemon="Charmander",
        role="seller",
    )
    u3 = User(
        id=3,
        email="carol@example.com",
        full_name="Carol",
        favorite_pokemon="Bulbasaur",
        role="buyer",
    )
    for u in (u1, u2, u3):
        users[u.id] = u
    next_user_id = 4

    l1 = Listing(
        id=1,
        name="Vintage Lamp",
        price=25.0,
        condition="used",
        user_id=1,
    )
    l2 = Listing(
        id=2,
        name="Standing Desk",
        price=150.0,
        condition="new",
        user_id=1,
    )
    l3 = Listing(
        id=3,
        name="Mechanical Keyboard",
        price=85.0,
        condition="used",
        user_id=1,
    )
    for l in (l1, l2, l3):
        listings[l.id] = l
    next_listing_id = 4

    _rebuild_email_index()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> Generator[None, None, None]:
    seed_data()
    yield


app = FastAPI(
    title="CRUD Demo API",
    description="In-memory users & listings. Auth: email + password `password`",
    version="0.1.0",
    lifespan=lifespan,
)

email_to_id: dict[str, int] = {}


def _rebuild_email_index() -> None:
    email_to_id.clear()
    for u in users.values():
        email_to_id[u.email.lower()] = u.id


def get_current_user(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
) -> User:
    if not credentials or not credentials.username or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Basic"},
        )
    if not secrets.compare_digest(credentials.password, DEMO_PASSWORD):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
            headers={"WWW-Authenticate": "Basic"},
        )
    uid = email_to_id.get(credentials.username.lower())
    if uid is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unknown user",
            headers={"WWW-Authenticate": "Basic"},
        )
    u = users.get(uid)
    if u is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Basic"},
        )
    return u


CurrentUser = Annotated[User, Depends(get_current_user)]


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


# --- Users ---


@app.get("/users", response_model=list[User], tags=["users"])
def list_users(_user: CurrentUser) -> list[User]:
    return list(users.values())


@app.get("/users/{user_id}", response_model=User, tags=["users"])
def get_user(user_id: int, _user: CurrentUser) -> User:
    u = users.get(user_id)
    if u is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return u


# --- Listings ---


@app.get("/listings", response_model=list[Listing], tags=["listings"])
def list_listings(_user: CurrentUser) -> list[Listing]:
    return list(listings.values())


@app.get("/listings/{listing_id}", response_model=Listing, tags=["listings"])
def get_listing(listing_id: int, _user: CurrentUser) -> Listing:
    l = listings.get(listing_id)
    if l is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return l


def require_seller(user: User) -> None:
    if user.role != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can create or modify listings",
        )


@app.post(
    "/listings",
    response_model=Listing,
    status_code=status.HTTP_201_CREATED,
    tags=["listings"],
)
def create_listing(body: ListingCreate, current: CurrentUser) -> Listing:
    require_seller(current)
    global next_listing_id
    new_id = next_listing_id
    next_listing_id += 1
    listing = Listing(
        id=new_id,
        name=body.name,
        price=body.price,
        condition=body.condition,
        user_id=current.id,
    )
    listings[new_id] = listing
    return listing


@app.put("/listings/{listing_id}", response_model=Listing, tags=["listings"])
def update_listing(
    listing_id: int,
    body: ListingUpdate,
    current: CurrentUser,
) -> Listing:
    require_seller(current)
    listing = listings.get(listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own listings",
        )
    data = body.model_dump(exclude_unset=True)
    if not data:
        return listing
    updated = listing.model_copy(update=data)
    listings[listing_id] = updated
    return updated


@app.delete(
    "/listings/{listing_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["listings"],
)
def delete_listing(listing_id: int, current: CurrentUser) -> None:
    require_seller(current)
    listing = listings.get(listing_id)
    if listing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    if listing.user_id != current.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own listings",
        )
    del listings[listing_id]
