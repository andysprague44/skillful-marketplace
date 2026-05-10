"""Fetch verified hamster photos from Wikimedia Commons and cache them as JSON.

We use the per-species Commons categories below so that every URL we keep
is human-classified as that species — a much higher signal than a keyword
search like "hamster" which would also return cartoons, food, plush toys, etc.

Run from the API directory with the venv active::

    source .venv/bin/activate
    python scripts/fetch_commons_photos.py

The result is written to ``scripts/data/hamster_photos.json`` and committed,
so the seed script does not need network access at run time.
"""

from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
from pathlib import Path

CATEGORIES: dict[str, str] = {
    "munchkin": "Mesocricetus_auratus",          # Syrian / golden / "teddy bear" hamsters
    "dwarf_winter_white": "Phodopus_sungorus",   # Winter white (Djungarian) dwarfs
    "dwarf_campbell": "Phodopus_campbelli",      # Campbell's dwarfs
    "roborovski": "Phodopus_roborovskii",        # Roborovski dwarfs
    "chinese": "Cricetulus_griseus",             # Chinese hamsters
    "other": "Cricetinae",                       # Catch-all subfamily
}

USER_AGENT = "HamstrSeed/0.1 (https://github.com/gmoore-al/skillful-marketplace)"

ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png"}

# Skip files whose Commons title hints at a non-photographic source
# (illustrations, taxonomy plates), an anatomical/medical reference shot
# (genital sexing, scent glands, dental closeups, hairless newborn pinkies),
# or a textbook-style multi-angle reference (front/side/top/rear).
#
# These are the cases that survived the per-species category filter but
# look gross / clinical / not-cute on a marketplace card. The user asked
# for cute fuzzy photos only, so we err on the side of exclusion here and
# rely on the visual contact-sheet curation step downstream to catch the
# remainder.
TITLE_BLOCK_TERMS: tuple[str, ...] = (
    # 19th-century engravings & taxonomy plates
    "Gartenlaube", "Brehms_Tierleben", "Brehms Tierleben",
    "Säugthiere", "Säugethiere", "Saugthiere", "Saeugthiere",
    "Abbildungen", "in_Abbildungen",
    "1873", "1880", "1888", "1890", "1900", "1910", "1920",
    "engraving", "illustration", "drawing", "Zeichnung",
    "diagram", "schematic", "skeleton", "taxidermy",

    # Anatomy / sex / medical reference shots
    "anatomy", "Geschlecht", "Gesclechtb", "Flankendr",
    "scent_gland", "scentgland", "teeth", "tooth", "brain",
    "pouch", "feet", "fuß", "fuss", "paw_closeup",
    "genital", "sexing", "rear",  # rear view often = underside / vent
    "3beine", "3_beine", "three_legs",  # likely medical
    "wound", "injury", "tumor", "tumour",

    # Hairless newborn "pinkies" — not cute on a pet listing
    "8_days_old", "9tage", "10_days", "litter15days",
    "pinky", "pinkies", "newborn",

    # Reference / multi-angle clinical shots (front/side/top variants)
    "_distribution", "distribution.jpg", "_burrow.png",
    "_maze.", "schema",

    # Misc not-a-pet-photo
    "Museum", "museum", "panoramio",
)


def is_blocked(title: str) -> bool:
    """Return True if the Commons file title looks like a non-photo source."""
    lowered = title.lower()
    return any(term.lower() in lowered for term in TITLE_BLOCK_TERMS)


def fetch_category(category: str, limit: int = 200) -> list[str]:
    """Return image URLs from a Commons category, filtered to common photo MIMEs.

    The ``thumburl`` field gives us a CDN-resized 640px-wide version of each
    image, which is what we want for marketplace cards. Falls back to the
    original ``url`` if the thumb isn't available.
    """
    qs = urllib.parse.urlencode(
        {
            "action": "query",
            "generator": "categorymembers",
            "gcmtitle": f"Category:{category}",
            "gcmtype": "file",
            "gcmlimit": str(limit),
            "prop": "imageinfo",
            "iiprop": "url|mime",
            "iiurlwidth": "640",
            "format": "json",
        }
    )
    url = f"https://commons.wikimedia.org/w/api.php?{qs}"
    req = urllib.request.Request(
        url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        data = json.load(response)

    pages = data.get("query", {}).get("pages", {}) or {}
    urls: list[str] = []
    for page in pages.values():
        info = (page.get("imageinfo") or [{}])[0]
        if info.get("mime") not in ALLOWED_MIME:
            continue
        if is_blocked(page.get("title", "")):
            continue
        candidate = info.get("thumburl") or info.get("url")
        if candidate:
            urls.append(candidate)
    # Deduplicate while preserving order.
    seen: set[str] = set()
    deduped: list[str] = []
    for u in urls:
        if u in seen:
            continue
        seen.add(u)
        deduped.append(u)
    return deduped


def main() -> int:
    """Fetch all configured categories and write the combined index to disk."""
    out: dict[str, list[str]] = {}
    total = 0
    for label, category in CATEGORIES.items():
        try:
            urls = fetch_category(category)
        except Exception as exc:
            print(f"  ! {label} ({category}) failed: {exc}", file=sys.stderr)
            urls = []
        out[label] = urls
        total += len(urls)
        print(f"  {label:22s} ({category:30s}) -> {len(urls):3d} photos")

    out_path = Path(__file__).resolve().parent / "data" / "hamster_photos.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {total} photo URLs across {len(out)} species to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
