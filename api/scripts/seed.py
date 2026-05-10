"""Seed the database with ~200 realistic hamster rehoming listings.

Photos come from ``scripts/data/hamster_photos_approved.json`` — a hand-
curated subset of Wikimedia Commons that we visually verified to contain
only cute, fuzzy pet hamsters (no illustrations, no anatomy reference
shots, no hairless newborn pinkies). The raw pool at
``hamster_photos.json`` is the fallback when the approved file is missing.

Refreshing the photo pool::

    python scripts/fetch_commons_photos.py    # pull latest URLs from Commons
    python scripts/curate_photos.py           # build per-species contact sheets
    # ... eyeball api/scripts/data/contact_sheets/*.png ...
    python scripts/build_approved_photos.py   # (re)write the approved JSON

Run from the API directory with the venv active::

    source .venv/bin/activate
    python scripts/seed.py            # idempotent: only seeds an empty table
    python scripts/seed.py --replace  # wipe + reseed (use for refreshing demos)
"""

from __future__ import annotations

import argparse
import itertools
import json
import random
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models import Hamster  # noqa: E402

DATA_DIR = Path(__file__).resolve().parent / "data"
# Hand-curated, visually-approved subset of the raw Commons pool. We
# prefer this file when present so listings only show "cute fuzzy" pet
# hamsters — no anatomy reference shots, no hairless newborn pinkies, no
# 19th-century engravings. The raw pool is the fallback for fresh checkouts
# that haven't yet run the curation pipeline.
APPROVED_PHOTOS_PATH = DATA_DIR / "hamster_photos_approved.json"
PHOTOS_PATH = DATA_DIR / "hamster_photos.json"
CITIES_PATH = DATA_DIR / "cities.json"

NAMES: tuple[str, ...] = (
    "Beatrice", "Mochi", "Pickle", "Captain Whiskers", "Tofu", "Pip",
    "Hazel", "Bean", "Biscuit", "Clover", "Dottie", "Echo", "Ferris",
    "Gilbert", "Honey", "Iggy", "Juno", "Kiwi", "Loki", "Marzipan",
    "Nibbles", "Oats", "Peanut", "Quill", "Ramen", "Sprout", "Tater",
    "Ursula", "Velvet", "Waffles", "Xander", "Yara", "Ziggy", "Acorn",
    "Bubbles", "Cinnamon", "Dumpling", "Espresso", "Fudge", "Ginger",
    "Hercules", "Inkwell", "Juniper", "Klondike", "Lentil", "Maple",
    "Noodle", "Ollie", "Poppy", "Quesadilla", "Radish", "Saffron",
    "Truffle", "Umami", "Violet", "Wonton", "Xerxes", "Yam", "Zucchini",
    "Apricot", "Boba", "Crouton", "Dinky", "Fennel", "Goji", "Halloumi",
    "Iris", "Jellybean", "Kale", "Lulu", "Miso", "Nori", "Olive",
    "Pesto", "Quokka", "Rosemary", "Sage", "Tahini", "Ube", "Vesper",
    "Wasabi", "Xena", "Yoshi", "Zelda", "Almond", "Brioche", "Custard",
    "Doughnut", "Eclair", "Frittata", "Gnocchi", "Halva", "Inca",
    "Java", "Kombu", "Latke",
)

LOCATIONS: tuple[str, ...] = (
    "Toronto, ON", "Ottawa, ON", "Montreal, QC", "Vancouver, BC",
    "Calgary, AB", "Edmonton, AB", "Halifax, NS", "Winnipeg, MB",
    "Quebec City, QC", "Victoria, BC", "Saskatoon, SK",
    "Seattle, WA", "Portland, OR", "San Francisco, CA", "Los Angeles, CA",
    "San Diego, CA", "Phoenix, AZ", "Austin, TX", "Houston, TX",
    "Dallas, TX", "Chicago, IL", "Denver, CO", "Minneapolis, MN",
    "Boston, MA", "New York, NY", "Brooklyn, NY", "Philadelphia, PA",
    "Pittsburgh, PA", "Washington, DC", "Atlanta, GA", "Miami, FL",
    "Orlando, FL", "Nashville, TN", "St. Louis, MO", "Detroit, MI",
    "Kansas City, MO", "Salt Lake City, UT", "Boise, ID",
)

HUMAN_NAMES: tuple[str, ...] = (
    "Alex", "Priya", "Jordan", "Sam", "Morgan", "Casey", "Robin",
    "Avery", "Riley", "Quinn", "Hayden", "Skylar", "Reese", "Sage",
    "Cameron", "Kai", "Drew", "Emerson", "Frankie", "Harper",
    "Iris", "Jules", "Kit", "Logan", "Mika", "Nico", "Oakley", "Parker",
    "Rowan", "Sasha", "Tate", "Val", "Wren", "Yuki",
)

GENDERS: tuple[tuple[str, int], ...] = (
    ("female", 45), ("male", 45), ("unknown", 10),
)

# Per-species weight; Syrian (munchkin) and Roborovski are the most common
# pet species in North America, so they show up most often.
SPECIES_WEIGHTS: tuple[tuple[str, int], ...] = (
    ("munchkin", 38),
    ("dwarf_winter_white", 18),
    ("roborovski", 20),
    ("dwarf_campbell", 10),
    ("chinese", 7),
    ("other", 7),
)

COLORS_BY_SPECIES: dict[str, tuple[str, ...]] = {
    "munchkin": (
        "Golden", "Black bear", "Cream", "Banded black and white",
        "Long-haired golden", "Sable", "Cinnamon", "Dove", "Tortoiseshell",
        "Dilute cinnamon",
    ),
    "dwarf_winter_white": (
        "Pearl", "Sapphire", "Sapphire pearl", "Marbled",
        "Standard agouti winter coat",
    ),
    "dwarf_campbell": (
        "Argente", "Blue fawn", "Opal", "Black-eyed argente",
        "Mottled", "Albino",
    ),
    "roborovski": (
        "Sandy with a white belly", "White-faced sandy", "Husky",
        "Platinum", "Pied",
    ),
    "chinese": (
        "Brown with a dorsal stripe", "Dominant spot", "Black-eyed white",
        "Cinnamon",
    ),
    "other": (
        "Pet shop mystery mix", "Varied", "Light brown", "Black-eyed cream",
    ),
}

TEMPERAMENTS: tuple[str, ...] = (
    "Curious, gentle, surprisingly opinionated about millet.",
    "Zoomies. Constant zoomies.",
    "Shy at first, then a total snack thief.",
    "Bold, friendly, slightly dramatic.",
    "Climber. Would live in the curtains if allowed.",
    "Cuddly once she trusts you. Trust takes about a week.",
    "Calm, slow blinks, accepts being held in cupped hands.",
    "Champion of the night-shift wheel.",
    "Stuffs both cheeks completely full of pellets.",
    "Polite. Will accept treats with a slight bow.",
    "Loves cardboard tubes more than anything.",
    "Watches you from the hideout, judges silently.",
    "Adventurer; needs out-of-cage time daily.",
    "Sweet, sleepy, tolerates baths in sand.",
    "Snack-motivated. Will work for sunflower seeds.",
)

INCLUDES_TEMPLATES: tuple[str, ...] = (
    "Bin cage (75L), {wheel}\" silent wheel, hideout, food + bedding for a month.",
    "20-gallon tank, {wheel}\" wheel, sand bath, deep substrate.",
    "Glass tank, mesh lid, wheel, all the bedding.",
    "Cage, wheel, six cardboard tubes (the good kind).",
    "Tall mesh enclosure, branches, hammock, food supply.",
    "Plastic modular cage, wheel, two hideouts, water bottle.",
    "DIY bin cage, {wheel}\" wheel, sand bath, chew toys.",
    "IKEA Detolf conversion, mesh lid, deep bedding, wheel.",
    "Faunarium with wire lid, wheel, bedding for a few weeks.",
)

STORY_TEMPLATES: tuple[str, ...] = (
    "{name} is a {age_word} {species_word} who has lived with us since "
    "{origin}. {pronoun_subj} loves {fav_thing} and is rehoming because "
    "{reason}. Looking for a {home_type} home.",
    "We adopted {name} from {origin} and {pronoun_subj}'s been an absolute "
    "joy. Big personality despite being palm-sized. Loves {fav_thing}. "
    "Rehoming due to {reason}.",
    "{name} arrived as a {age_word} {species_word} and has grown into a "
    "{trait} little hamster. {pronoun_subj} would do best in a {home_type} "
    "household. {reason_sentence}",
    "Honest pitch: {name} is {trait} and not for a beginner. {pronoun_subj} "
    "loves {fav_thing}, ignores most toys, and has very specific opinions "
    "about bedding depth. {reason_sentence}",
    "{name} is a calm, observant {species_word}. Comfortable being held, "
    "great at burrowing, doesn't bite. {reason_sentence}",
)

ORIGINS: tuple[str, ...] = (
    "a local rescue", "a friend who couldn't keep him", "a friend who couldn't keep her",
    "a pet store rehoming", "a colleague's surprise litter",
    "the SPCA's small animals room", "an ad on a community board",
)

FAV_THINGS: tuple[str, ...] = (
    "stuffing his cheeks", "running for hours on the wheel",
    "sleeping in the cardboard castle", "exploring the bathtub playpen",
    "gnawing on apple branches", "burrowing in deep paper bedding",
    "millet sprigs", "sunflower seeds", "hand-fed mealworms",
)

REASONS: tuple[str, ...] = (
    "we're moving overseas", "a new family allergy",
    "a baby on the way needing the room",
    "switching careers and travelling more",
    "moving to a no-pets building",
    "we need to downsize and can't take her with us",
)

HOME_TYPES: tuple[str, ...] = (
    "quiet", "patient", "experienced", "kid-free", "calm and routine-driven",
)

TRAITS: tuple[str, ...] = (
    "spirited", "sweet", "shy", "bold", "athletic", "cuddly", "independent",
    "talkative", "watchful", "observant",
)


def weighted_choice(rng: random.Random, options: tuple[tuple[str, int], ...]) -> str:
    """Return one option string sampled by integer weight."""
    values, weights = zip(*options, strict=True)
    return rng.choices(values, weights=weights, k=1)[0]


def species_word(species: str) -> str:
    """Render a species enum value as a friendly noun phrase for stories."""
    return {
        "munchkin": "Syrian",
        "dwarf_winter_white": "winter white dwarf",
        "dwarf_campbell": "Campbell's dwarf",
        "roborovski": "Roborovski",
        "chinese": "Chinese hamster",
        "other": "hamster",
    }[species]


def age_word(months: int) -> str:
    """Map an age in months to a casual descriptor for stories."""
    if months < 4:
        return "tiny pup"
    if months < 12:
        return "young"
    if months < 24:
        return "lively adult"
    return "gentle senior"


def build_story(rng: random.Random, name: str, species: str, age: int, gender: str) -> str:
    """Render one story using a randomly-chosen template + per-listing details."""
    pronouns = {"female": "she", "male": "he", "unknown": "they"}
    pronoun_subj = pronouns[gender]
    template = rng.choice(STORY_TEMPLATES)
    reason = rng.choice(REASONS)
    return template.format(
        name=name,
        age_word=age_word(age),
        species_word=species_word(species),
        pronoun_subj=pronoun_subj,
        fav_thing=rng.choice(FAV_THINGS),
        origin=rng.choice(ORIGINS),
        reason=reason,
        reason_sentence=f"Rehoming because {reason}.",
        home_type=rng.choice(HOME_TYPES),
        trait=rng.choice(TRAITS),
    )


def build_includes(rng: random.Random) -> str:
    """Render one 'what's included' line, filling in template slots."""
    return rng.choice(INCLUDES_TEMPLATES).format(wheel=rng.choice([6, 8, 10, 11]))


def load_photo_pool() -> dict[str, list[str]]:
    """Load the photo pool, preferring the visually-approved allowlist.

    The approved list is the output of ``scripts/build_approved_photos.py``
    and is what production seeding should use. The raw Commons pool is a
    fallback so a fresh clone (or a CI job) without the curation artefacts
    can still seed the demo with reasonable photos.
    """
    if APPROVED_PHOTOS_PATH.exists():
        return json.loads(APPROVED_PHOTOS_PATH.read_text())
    if PHOTOS_PATH.exists():
        print(
            f"  ! {APPROVED_PHOTOS_PATH.name} missing — falling back to raw "
            f"{PHOTOS_PATH.name}. Photos may include illustrations or anatomy "
            "shots; run scripts/build_approved_photos.py to fix.",
        )
        return json.loads(PHOTOS_PATH.read_text())
    raise SystemExit(
        f"Missing photo pool: expected {APPROVED_PHOTOS_PATH} or {PHOTOS_PATH}. "
        "Run scripts/fetch_commons_photos.py and scripts/build_approved_photos.py."
    )


def load_city_coords() -> dict[str, tuple[float, float]]:
    """Load the city → (lat, lng) lookup used to place pins on the map."""
    if not CITIES_PATH.exists():
        raise SystemExit(f"Missing {CITIES_PATH}.")
    raw = json.loads(CITIES_PATH.read_text())
    return {city: (float(lat), float(lng)) for city, (lat, lng) in raw.items()}


def jitter_coord(rng: random.Random, lat: float, lng: float) -> tuple[float, float]:
    """Offset a coordinate by a small random amount so multiple listings in the
    same city don't perfectly overlap on the map. The offset is well under
    1km so pins stay inside the actual city bounds.
    """
    return (
        lat + rng.uniform(-0.015, 0.015),
        lng + rng.uniform(-0.015, 0.015),
    )


def generate(count: int, seed: int = 42) -> list[dict[str, object]]:
    """Generate ``count`` deterministic hamster listings with verified photos.

    A seeded ``random.Random`` keeps the dataset reproducible across runs.
    Photo URLs cycle within their species pool so every image is a real
    photo of that exact species rather than a generic 'rodent' stock image.
    """
    rng = random.Random(seed)
    pool = load_photo_pool()
    photo_iters = {
        species: itertools.cycle(rng.sample(urls, k=len(urls)))
        for species, urls in pool.items()
        if urls
    }
    coords = load_city_coords()

    listings: list[dict[str, object]] = []
    for i in range(count):
        species = weighted_choice(rng, SPECIES_WEIGHTS)
        if species not in photo_iters:
            species = "munchkin"  # fallback to the largest pool
        gender = weighted_choice(rng, GENDERS)
        age = max(1, int(rng.triangular(2, 36, 8)))  # skew younger
        fee_dollars = rng.choices(
            [0, 25, 45, 65, 85, 100, 125, 150, 175, 200],
            weights=[3, 5, 7, 9, 9, 7, 6, 4, 3, 2],
            k=1,
        )[0]
        name = NAMES[i % len(NAMES)]
        if i >= len(NAMES):
            # Avoid duplicate primary keys-by-name; suffix with a roman numeral.
            roman = "II III IV V VI VII VIII IX X".split()
            name = f"{name} {roman[(i // len(NAMES)) - 1]}"
        human = rng.choice(HUMAN_NAMES)
        location = rng.choice(LOCATIONS)
        base = coords.get(location)
        latitude: float | None = None
        longitude: float | None = None
        if base is not None:
            latitude, longitude = jitter_coord(rng, *base)
        listings.append(
            {
                "name": name,
                "species": species,
                "age_months": age,
                "gender": gender,
                "color": rng.choice(COLORS_BY_SPECIES[species]),
                "temperament": rng.choice(TEMPERAMENTS),
                "story": build_story(rng, name, species, age, gender),
                "includes": build_includes(rng),
                "adoption_fee_cents": fee_dollars * 100,
                "location": location,
                "latitude": latitude,
                "longitude": longitude,
                "photo_url": next(photo_iters[species]),
                "current_human_name": human,
                "current_human_email": f"{human.lower()}{i}@example.com",
            }
        )
    return listings


def seed(replace: bool, count: int) -> int:
    """Insert listings into the hamsters table.

    With ``replace=True`` (or an empty table), wipe and insert ``count``
    fresh rows. Otherwise, leave existing data alone.
    """
    rows = generate(count)
    with SessionLocal() as session:
        existing = session.query(Hamster).count()
        if existing and not replace:
            print(
                f"Skipping seed: {existing} hamster(s) already present. "
                "Pass --replace to wipe and reseed."
            )
            return 0
        if existing:
            # TRUNCATE … RESTART IDENTITY so reseeded rows start at id=1 again,
            # which keeps URLs like /hamsters/8 working across reseeds.
            session.execute(
                text("TRUNCATE TABLE hamsters RESTART IDENTITY CASCADE")
            )
        session.add_all(Hamster(**row) for row in rows)
        session.commit()
        print(f"Inserted {len(rows)} hamsters.")
        return len(rows)


def parse_args() -> argparse.Namespace:
    """Parse CLI flags for the seed entrypoint."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--count",
        type=int,
        default=200,
        help="How many hamster listings to generate (default: 200).",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Wipe existing rows and reseed (default: preserve existing data).",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    seed(replace=args.replace, count=args.count)
