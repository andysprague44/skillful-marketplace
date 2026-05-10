"""Compose the human-approved Wikimedia Commons photo allowlist.

This is the second half of the curation pipeline started by
``curate_photos.py``. It records — by index into the cleaned
``data/hamster_photos.json`` — exactly which photos passed the visual
"cute fuzzy hamster" review, then writes them out as a flat URL list per
species in ``data/hamster_photos_approved.json`` for the seeder.

Editing workflow when the source pool changes:

1. Re-run ``python scripts/curate_photos.py`` to refresh the contact sheets.
2. Eyeball each sheet under ``data/contact_sheets/``.
3. Update ``DROPPED_INDICES`` below with anything that should be excluded
   (the rest is approved by default — easier than maintaining a long
   allowlist).
4. Re-run this script to regenerate ``hamster_photos_approved.json``.

Why "drop list" instead of "approve list":
   The vast majority of the cleaned pool is good after the title-based
   blocklist runs. A drop list keeps this file short and makes it obvious
   which specific images were rejected and why.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
SOURCE_PATH = DATA_DIR / "hamster_photos.json"
APPROVED_PATH = DATA_DIR / "hamster_photos_approved.json"

# Indices to exclude per species, with the reason recorded for posterity
# so future re-curators don't have to re-discover the problem.
DROPPED_INDICES: dict[str, dict[int, str]] = {
    "munchkin": {
        2: "B&W reference-style profile, looks more like an illustration",
        10: "rear-end view of hamster going into a tunnel",
        13: "rear/butt-only view, no face",
    },
    "dwarf_winter_white": {
        0: "underside / belly reference shot, looks clinical",
    },
    "dwarf_campbell": {
        2: "genital sexing reference shot (titled 'female')",
        3: "genital sexing reference shot (titled 'male')",
    },
    "roborovski": {
        6: "litter of pink hairless newborn pinkies — not pet-listing-cute",
        16: "litter of pink hairless newborn pinkies in a nest",
    },
    "chinese": {
        8: "wide habitat shot, the hamster is a tiny speck",
        10: "hamster is lying flat on its side, looks unwell",
    },
    "other": {},
}


def main() -> int:
    if not SOURCE_PATH.exists():
        print(f"Missing {SOURCE_PATH}; run curate_photos.py first.", file=sys.stderr)
        return 1
    pool = json.loads(SOURCE_PATH.read_text())

    approved: dict[str, list[str]] = {}
    total_in = 0
    total_out = 0
    for species, urls in pool.items():
        drops = DROPPED_INDICES.get(species, {})
        kept = [u for i, u in enumerate(urls) if i not in drops]
        approved[species] = kept
        total_in += len(urls)
        total_out += len(kept)
        print(
            f"  {species:22s}  approved {len(kept):3d}  "
            f"of {len(urls):3d}  (dropped {len(drops)})"
        )
        for idx, reason in sorted(drops.items()):
            print(f"     - drop #{idx:<3}  {reason}")

    APPROVED_PATH.write_text(json.dumps(approved, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {total_out} approved URLs (of {total_in}) -> {APPROVED_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
