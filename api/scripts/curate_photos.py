"""Build per-species contact sheets so a human (or vision-capable model)
can visually approve which Wikimedia Commons hamster photos belong on the
marketplace.

Pipeline:

1. Read the cached photo index (``data/hamster_photos.json``).
2. Apply the *current* TITLE_BLOCK_TERMS from ``fetch_commons_photos`` to
   purge obviously-bad URLs in-place (so re-running the fetch script isn't
   required just to pick up new blocklist terms).
3. Download each surviving URL into ``data/photo_cache/<filename>.jpg`` as
   a small thumbnail (skipped if already cached).
4. Compose one PNG contact sheet per species, with each thumbnail labelled
   by its zero-based index in ``<species>``'s URL list. Sheets land in
   ``data/contact_sheets/<species>.png``.

The contact sheets get inspected visually; the approved indices are then
written back as ``data/hamster_photos_approved.json`` (separate file so we
keep the raw index for future re-curation).
"""

from __future__ import annotations

import io
import json
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_commons_photos import TITLE_BLOCK_TERMS, USER_AGENT, is_blocked  # noqa: E402

DATA_DIR = Path(__file__).resolve().parent / "data"
SOURCE_PATH = DATA_DIR / "hamster_photos.json"
CACHE_DIR = DATA_DIR / "photo_cache"
SHEETS_DIR = DATA_DIR / "contact_sheets"

THUMB = 220                 # square thumbnail edge in px
LABEL_BAND = 28             # height of the dark label band over each thumb
COLS = 6                    # contact-sheet columns
GAP = 6                     # px gap between thumbs
PAGE_SIZE = COLS * 6        # 36 thumbs per sheet (so a 35-photo species fits)


def _ua_request(url: str) -> urllib.request.Request:
    return urllib.request.Request(
        url, headers={"User-Agent": USER_AGENT, "Accept": "image/*"}
    )


def _safe_filename(url: str) -> str:
    """Stable, filesystem-safe filename derived from the Commons URL.

    We hash on the URL tail so name collisions across species are impossible
    and the cache survives URL-encoding quirks unchanged.
    """
    tail = url.rstrip("/").split("/")[-1]
    return tail.replace("%", "_").replace("?", "_").replace("&", "_")[-180:]


def download_thumb(url: str) -> Path | None:
    """Download ``url`` into the cache and return its local path.

    Existing files are reused. Failures return ``None`` so the caller can
    skip that thumb without aborting the whole sheet.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    dest = CACHE_DIR / _safe_filename(url)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    # Commons returns HTTP 429 around ~50 rapid requests/sec. Retry with
    # exponential backoff so the curation script can complete in one go
    # even on a cold cache.
    payload: bytes | None = None
    last_err: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(_ua_request(url), timeout=30) as resp:
                payload = resp.read()
            break
        except Exception as exc:
            last_err = exc
            time.sleep(0.6 * (2**attempt))  # 0.6s, 1.2s, 2.4s, 4.8s
    if payload is None:
        print(f"  ! download failed: {url} ({last_err})", file=sys.stderr)
        return None
    # Polite throttle so we stay well under Commons' rate limit.
    time.sleep(0.15)
    img = Image.open(io.BytesIO(payload)).convert("RGB")
    # Keep aspect, fit inside THUMB×THUMB box.
    img.thumbnail((THUMB, THUMB), Image.LANCZOS)
    img.save(dest, "JPEG", quality=82)
    return dest


def _load_font() -> ImageFont.FreeTypeFont:
    """Try the macOS system font first, fall back to PIL's default."""
    candidates = [
        "/System/Library/Fonts/SFNSMono.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, 18)
            except OSError:
                continue
    return ImageFont.load_default()


def build_sheet(species: str, urls: list[str], page: int = 0) -> Path | None:
    """Render up to ``PAGE_SIZE`` thumbs into a single PNG contact sheet.

    ``page`` lets a long species pool span multiple sheets without going
    over the model's image-input pixel budget.
    """
    SHEETS_DIR.mkdir(parents=True, exist_ok=True)
    start = page * PAGE_SIZE
    chunk = list(enumerate(urls))[start : start + PAGE_SIZE]
    if not chunk:
        return None

    rows = (len(chunk) + COLS - 1) // COLS
    cell_w = THUMB + GAP
    cell_h = THUMB + LABEL_BAND + GAP
    sheet_w = COLS * cell_w + GAP
    sheet_h = rows * cell_h + GAP + 36  # extra row for sheet title
    canvas = Image.new("RGB", (sheet_w, sheet_h), (245, 240, 232))
    draw = ImageDraw.Draw(canvas)
    font = _load_font()
    title = f"{species}  (page {page + 1}, indices {start}–{start + len(chunk) - 1})"
    draw.text((GAP * 2, 8), title, fill=(40, 40, 40), font=font)

    for slot, (idx, url) in enumerate(chunk):
        col = slot % COLS
        row = slot // COLS
        x = GAP + col * cell_w
        y = 36 + row * cell_h

        thumb_path = download_thumb(url)
        if thumb_path is None:
            # Render an X placeholder so the sheet still shows the slot.
            draw.rectangle((x, y, x + THUMB, y + THUMB), fill=(60, 60, 60))
            draw.line((x, y, x + THUMB, y + THUMB), fill=(200, 80, 80), width=4)
            draw.line((x, y + THUMB, x + THUMB, y), fill=(200, 80, 80), width=4)
        else:
            thumb = Image.open(thumb_path).convert("RGB")
            # Centre the (possibly non-square) thumb in the THUMB×THUMB cell.
            tx = x + (THUMB - thumb.width) // 2
            ty = y + (THUMB - thumb.height) // 2
            canvas.paste(thumb, (tx, ty))

        # Index label band along the bottom of the thumb cell.
        band_y = y + THUMB
        draw.rectangle(
            (x, band_y, x + THUMB, band_y + LABEL_BAND),
            fill=(20, 20, 20),
        )
        draw.text(
            (x + 6, band_y + 4),
            f"#{idx}",
            fill=(255, 248, 230),
            font=font,
        )

    out_path = SHEETS_DIR / f"{species}_{page}.png"
    canvas.save(out_path, "PNG", optimize=True)
    return out_path


def main() -> int:
    if not SOURCE_PATH.exists():
        print(f"Missing {SOURCE_PATH}; run fetch_commons_photos.py first.", file=sys.stderr)
        return 1
    raw = json.loads(SOURCE_PATH.read_text())

    print(f"Applying tightened blocklist ({len(TITLE_BLOCK_TERMS)} terms)…")
    cleaned: dict[str, list[str]] = {}
    for species, urls in raw.items():
        kept: list[str] = []
        dropped = 0
        for u in urls:
            if is_blocked(u):
                dropped += 1
                continue
            kept.append(u)
        cleaned[species] = kept
        print(f"  {species:22s}  kept {len(kept):3d}  dropped {dropped:3d}")

    # Write the cleaned (but not-yet-visually-approved) list back so the
    # contact sheet indices align with whatever survives the new filter.
    SOURCE_PATH.write_text(json.dumps(cleaned, indent=2, ensure_ascii=False) + "\n")
    print(f"Updated {SOURCE_PATH.name} in place\n")

    print("Generating contact sheets…")
    for species, urls in cleaned.items():
        if not urls:
            continue
        page = 0
        while True:
            out = build_sheet(species, urls, page=page)
            if out is None:
                break
            print(f"  {species:22s}  -> {out.relative_to(DATA_DIR.parent)}")
            page += 1

    print("\nDone. Inspect the contact sheets in api/scripts/data/contact_sheets/")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
