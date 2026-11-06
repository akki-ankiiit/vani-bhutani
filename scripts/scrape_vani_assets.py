#!/usr/bin/env python3
"""Collect Vani Bhutani Designs media from the authorised univer.se site.

One controlled run: renders every reference page with Playwright, scrolls to
trigger lazy-loading, parses the rendered DOM with BeautifulSoup, de-duplicates
by Imgix asset id, downloads each asset once and writes a JSON manifest.

    python3 -m venv .venv && .venv/bin/pip install playwright beautifulsoup4 Pillow
    .venv/bin/python scripts/scrape_vani_assets.py [--skip-download]
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup
from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "vani"
MANIFEST = OUT / "asset-manifest.json"
SOURCE_CONTENT = ROOT / "docs" / "vani-source-content.json"
MEDIA_INDEX = ROOT / "src" / "data" / "vani-media.json"
BASE = "https://vbdesigns.univer.se"
IMGIX = "https://onuniverse-assets.imgix.net"

# Visit order follows the brief; folder priority decides where shared assets live.
PAGES = {
    "home": "/",
    "published": "/photo-gallery",
    "archive": "/projects-archive",
    "residential": "/ri",
    "commercial": "/ci",
    "e-services": "/e-services",
}
FOLDER_FOR_PAGE = {
    "residential": "residential",
    "commercial": "commercial",
    "published": "published",
    "archive": "miscellaneous",
    "e-services": "miscellaneous",
    "home": "about",
}
PRIORITY = ["residential", "commercial", "published", "archive", "e-services", "home"]

# Longest-edge cap keeps large-display quality while avoiding multi-megabyte
# originals; Imgix fit=max never upscales or crops, so proportions are preserved.
MAX_DIM = 2000
QUALITY = 76
HERO_DIM = 2880
# Asset ids chosen (after reviewing the contact sheet) for the full-bleed hero.
# They are additionally exported at a larger size into hero/.
HERO_PICKS: dict[str, str] = {
    "fcbd1964-8957-4100-8dd8-8ba5d4c05ef6": "avencia-courtyard-day",
    "aad98b61-52a5-4e67-8a8e-c27de54286f8": "avencia-courtyard-night",
}
# Published features are identified by their outbound article link.
PUBLICATIONS = {
    "architecturaldigest": "architectural-digest-wabi-sabi-surat-home",
    "elledecor": "elle-decor-bold-and-modern",
    "designpataki": "design-pataki-childrens-rooms",
}
# Homepage images are named from the copy block they sit beside.
HOME_CONTEXT = [("defining style", "phaidon-defining-style"), ("residential projects", "vani-bhutani-studio")]
YEAR_HEADING = re.compile(r"^(.{2,60}?)\s*\(\s*(\d{4})\s*\)")
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")

# Runs in the page: walks the DOM in document order so every image is tagged
# with the project heading / text block that precedes it.
COLLECT_JS = r"""
() => {
  const out = []; let heading = ''; let text = '';
  const yearRe = /\(\s*\d{4}\s*\)/;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const bgUrl = el => {
    const bg = getComputedStyle(el).backgroundImage || '';
    const m = [...bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(x => x[1]);
    return m;
  };
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeType === 3) {
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (t.length > 2 && !/^(swipe|tap on photo|✦)/i.test(t)) {
        text = t.slice(0, 220);
        if (yearRe.test(t) && t.length < 80) heading = t;
      }
      continue;
    }
    const el = n;
    const link = el.closest('a[href]');
    const base = { heading, text, href: link ? link.href : '' };
    if (el.tagName === 'IMG') {
      const urls = [el.currentSrc, el.src, el.getAttribute('data-src'), el.getAttribute('data-lazy-src'),
        el.getAttribute('data-original'), ...(el.getAttribute('srcset') || '').split(',').map(s => s.trim().split(' ')[0]),
        ...(el.getAttribute('data-srcset') || '').split(',').map(s => s.trim().split(' ')[0])].filter(Boolean);
      out.push({ ...base, kind: 'img', urls, alt: el.alt || '', w: el.naturalWidth, h: el.naturalHeight });
    } else if (el.tagName === 'SOURCE') {
      const urls = (el.getAttribute('srcset') || el.getAttribute('src') || '').split(',').map(s => s.trim().split(' ')[0]).filter(Boolean);
      if (urls.length) out.push({ ...base, kind: el.parentElement && el.parentElement.tagName === 'VIDEO' ? 'video' : 'source', urls, alt: '' });
    } else if (el.tagName === 'VIDEO') {
      const urls = [el.poster, el.src].filter(Boolean);
      if (urls.length) out.push({ ...base, kind: 'video', urls, alt: el.getAttribute('aria-label') || '' });
    } else {
      const urls = bgUrl(el);
      if (urls.length) out.push({ ...base, kind: 'background', urls, alt: el.getAttribute('aria-label') || '' });
    }
  }
  return out;
}
"""


def slugify(value: str, limit: int = 48) -> str:
    value = value.lower().replace("'", "").replace("’", "")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value[:limit].rstrip("-") or "image"


def asset_id(url: str) -> str | None:
    parsed = urlparse(url)
    if "imgix.net" not in parsed.netloc and "univer.se" not in parsed.netloc:
        return None
    match = UUID.search(parsed.path)
    return match.group(0) if match else None


def render_pages() -> tuple[dict, dict]:
    """Render each page once; return raw DOM records and page text/links."""
    records, content = {}, {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        for key, path in PAGES.items():
            url = BASE + path
            print(f"→ {url}")
            page.goto(url, wait_until="networkidle", timeout=90_000)
            page.wait_for_timeout(1200)
            # Gradual scroll so lazy-loaded media resolves.
            last = -1
            for _ in range(120):
                page.mouse.wheel(0, 700)
                page.wait_for_timeout(180)
                y = page.evaluate("window.scrollY + window.innerHeight")
                h = page.evaluate("document.body.scrollHeight")
                if y >= h and y == last:
                    break
                last = y
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(1500)
            records[key] = page.evaluate(COLLECT_JS)
            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            # BeautifulSoup pass catches lazy attributes / inline styles the
            # browser had not resolved into currentSrc.
            extra = []
            for tag in soup.find_all(True):
                for attr in ("src", "data-src", "data-lazy-src", "data-bg", "poster", "srcset", "data-srcset", "style"):
                    val = tag.get(attr)
                    if val and ("imgix" in val or "univer.se" in val):
                        extra += re.findall(r"https?://[^\s\"'(),]+", val)
            records[key].append({"kind": "html", "urls": extra, "alt": "", "heading": "", "text": "", "href": ""})
            content[key] = {
                "url": url,
                "title": page.title(),
                "text": page.inner_text("body"),
                "links": page.eval_on_selector_all(
                    "a[href]", "els => els.map(e => ({ href: e.href, text: e.innerText.trim().slice(0, 160) }))"
                ),
            }
        browser.close()
    return records, content


def consolidate(records: dict) -> list[dict]:
    assets: dict[str, dict] = {}
    for key in PRIORITY:
        for rec in records.get(key, []):
            for raw in rec["urls"]:
                aid = asset_id(raw)
                if not aid:
                    continue
                entry = assets.setdefault(aid, {
                    "id": aid, "originalUrl": raw.split("?")[0], "discoveredUrls": [],
                    "sourcePage": BASE + PAGES[key], "pageKey": key, "alt": "", "heading": "",
                    "context": "", "link": "", "kind": rec["kind"], "seenOn": [],
                })
                if raw not in entry["discoveredUrls"]:
                    entry["discoveredUrls"].append(raw)
                if BASE + PAGES[key] not in entry["seenOn"]:
                    entry["seenOn"].append(BASE + PAGES[key])
                for field, src in (("alt", "alt"), ("heading", "heading"), ("context", "text"), ("link", "href")):
                    if not entry[field] and rec.get(src) and entry["pageKey"] == key:
                        entry[field] = rec[src]
    # Preserve document order within each page.
    return list(assets.values())


def classify(entry: dict) -> tuple[str, str | None, str]:
    alt = entry["alt"].lower()
    if "logo" in alt:
        return "logo", None, "vani-logo" if "van" in alt else "vani-logo-mark"
    match = YEAR_HEADING.match(entry["heading"]) if entry["heading"] else None
    project = None
    if match and entry["pageKey"] in ("residential", "commercial", "archive"):
        project = re.sub(r"\s+", " ", match.group(1)).strip()
        return FOLDER_FOR_PAGE[entry["pageKey"]], project, slugify(project)
    base = entry["pageKey"]
    if entry["pageKey"] == "published":
        base = next((v for k, v in PUBLICATIONS.items() if k in entry["link"]), "published-feature")
        project = base
    if entry["pageKey"] == "home":
        context = entry["context"].lower()
        base = next((v for k, v in HOME_CONTEXT if k in context), "studio")
    return FOLDER_FOR_PAGE[entry["pageKey"]], project, slugify(base)


def download(entry: dict, session: requests.Session, path_stem: Path, keep_png: bool, dim: int = MAX_DIM) -> dict:
    fmt = "png" if keep_png else "webp"
    url = f"{IMGIX}/{entry['id']}?fit=max&w={dim}&h={dim}&q={QUALITY}&fm={fmt}"
    resp = session.get(url, timeout=60)
    resp.raise_for_status()
    data = resp.content
    img = Image.open(io.BytesIO(data))
    img.verify()  # raises on corruption
    img = Image.open(io.BytesIO(data))
    target = path_stem.with_suffix("." + fmt)
    target.write_bytes(data)
    return {"downloadUrl": url, "width": img.width, "height": img.height, "fileType": f"image/{fmt}",
            "bytes": len(data), "file": "/" + str(target.relative_to(ROOT / "public"))}


def derive_logo_variants() -> None:
    """Trim the authentic logo files so they sit precisely in the existing
    header/preloader slots (used as CSS masks, so they inherit theme colour)."""
    logo_dir = OUT / "logo"
    for src, dst, square in (("vani-logo.png", "vani-wordmark.png", False),
                             ("vani-logo-mark.png", "vani-mark.png", True)):
        path = logo_dir / src
        if not path.exists():
            continue
        img = Image.open(path).convert("RGBA")
        img = img.crop(img.getbbox())
        if square:
            # Drop the registered-trademark glyph to the right of the triangle
            # for the small circular seal; keep proportions on a square canvas.
            alpha = img.split()[-1]
            cols = [any(alpha.getpixel((x, y)) for y in range(img.height // 3, img.height)) for x in range(img.width)]
            right = max(i for i, c in enumerate(cols) if c) + 1
            img = img.crop((0, 0, right, img.height))
            side = max(img.size)
            canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            canvas.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
            img = canvas.resize((512, 512), Image.LANCZOS)
        img.save(logo_dir / dst, optimize=True)
        print("logo:", dst, img.size)


def write_media_index(assets: list[dict]) -> None:
    """Compact path -> [width, height, alt] index the React app imports, so
    every <img> gets intrinsic dimensions (no layout shift)."""
    index = {}
    for a in assets:
        if a.get("status") != "downloaded":
            continue
        index[a["file"]] = [a["width"], a["height"], a.get("alt", "")]
        if a.get("heroFile"):
            index[a["heroFile"]] = [a["heroWidth"], a["heroHeight"], a.get("alt", "")]
    MEDIA_INDEX.write_text(json.dumps(index, separators=(",", ":"), ensure_ascii=False))
    print(f"media index: {len(index)} entries")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument("--hero-only", action="store_true",
                        help="reuse the saved manifest and only (re)export HERO_PICKS")
    args = parser.parse_args()

    if args.hero_only:
        data = json.loads(MANIFEST.read_text())
        session = requests.Session()
        (OUT / "hero").mkdir(parents=True, exist_ok=True)
        for item in data["assets"]:
            if item["id"] in HERO_PICKS:
                hero = download({"id": item["id"]}, session, OUT / "hero" / HERO_PICKS[item["id"]], False, HERO_DIM)
                item["heroFile"] = hero["file"]
                item["heroWidth"], item["heroHeight"] = hero["width"], hero["height"]
                print("hero:", hero["file"], hero["width"], hero["height"])
        MANIFEST.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        derive_logo_variants()
        write_media_index(data["assets"])
        return 0

    records, content = render_pages()
    SOURCE_CONTENT.parent.mkdir(parents=True, exist_ok=True)
    SOURCE_CONTENT.write_text(json.dumps(content, indent=2, ensure_ascii=False))
    assets = consolidate(records)
    print(f"Discovered {len(assets)} unique assets "
          f"({sum(len(a['discoveredUrls']) for a in assets)} URL variants)")

    session = requests.Session()
    session.headers["User-Agent"] = "Mozilla/5.0 (VaniBhutaniDesigns asset sync)"
    counters: dict[str, int] = {}
    manifest = []
    for entry in assets:
        folder, project, stem = classify(entry)
        counters[stem] = counters.get(stem, 0) + 1
        name = stem if folder == "logo" and counters[stem] == 1 else f"{stem}-{counters[stem]:02d}"
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        item = {
            "id": entry["id"], "originalUrl": entry["originalUrl"], "discoveredUrls": entry["discoveredUrls"],
            "sourcePage": entry["sourcePage"], "seenOn": entry["seenOn"], "alt": entry["alt"],
            "project": project, "section": folder, "context": entry["context"], "link": entry["link"],
            "kind": entry["kind"], "status": "pending",
        }
        if not args.skip_download:
            try:
                item.update(download(entry, session, OUT / folder / name, keep_png=folder == "logo"))
                item["status"] = "downloaded"
                if entry["id"] in HERO_PICKS:
                    (OUT / "hero").mkdir(parents=True, exist_ok=True)
                    hero = download(entry, session, OUT / "hero" / HERO_PICKS[entry["id"]], False, HERO_DIM)
                    item["heroFile"] = hero["file"]
                    item["heroWidth"], item["heroHeight"] = hero["width"], hero["height"]
            except Exception as exc:  # record, never substitute
                item["status"] = "failed"
                item["error"] = str(exc)
                print(f"  ✗ {entry['id']}: {exc}", file=sys.stderr)
        manifest.append(item)

    derive_logo_variants()
    write_media_index(manifest)
    ok = sum(1 for m in manifest if m["status"] == "downloaded")
    summary = {"source": BASE, "pages": {k: BASE + v for k, v in PAGES.items()},
               "discovered": len(manifest), "downloaded": ok,
               "failed": [m["id"] for m in manifest if m["status"] == "failed"]}
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps({"summary": summary, "assets": manifest}, indent=2, ensure_ascii=False))
    print(json.dumps(summary, indent=2))
    return 0 if not summary["failed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
