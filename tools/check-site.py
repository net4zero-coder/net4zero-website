#!/usr/bin/env python3
"""
NET4ZERO — walidator statycznej strony.

Sprawdza to, co przy każdej zmianie treści/SEO i tak sprawdzamy ręcznie:
  1. meta description  — obecność + długość 120–160 znaków
  2. <title>           — obecność + długość 30–65 znaków
  3. rel=canonical     — obecność, absolutny URL, bez sufiksu .html
  4. og:url            — zgodność z canonical
  5. JSON-LD           — poprawność składni + @id bez .html
  6. sitemap.xml       — każda publiczna podstrona jest w sitemapie i odwrotnie
  7. linki wewnętrzne  — czy prowadzą do istniejącego pliku
  8. output.css        — czy zawiera wszystkie klasy Tailwind użyte w HTML
  9. placeholdery      — PLACEHOLDER_* / GTM-PLACEHOLDER nie mogą trafić na produkcję

Użycie:
    python3 tools/check-site.py            # pełny raport, kod 1 przy błędzie
    python3 tools/check-site.py --quiet    # tylko błędy i ostrzeżenia

Kod wyjścia: 0 = brak błędów (ostrzeżenia nie blokują), 1 = są błędy.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://www.net4zero.pl"

# Strony celowo poza sitemapą i poza wymogami SEO (noindex / techniczne).
EXCLUDED = {"404.html", "dziekujemy.html"}

DESC_MIN, DESC_MAX = 120, 160
TITLE_MIN, TITLE_MAX = 30, 65

errors: list[str] = []
warnings: list[str] = []


def err(page: str, msg: str) -> None:
    errors.append(f"{page}: {msg}")


def warn(page: str, msg: str) -> None:
    warnings.append(f"{page}: {msg}")


def html_files() -> list[Path]:
    files = sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("slownik/*.html"))
    return [f for f in files if "node_modules" not in f.parts]


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def attr(html: str, pattern: str) -> str | None:
    m = re.search(pattern, html, re.I | re.S)
    return m.group(1).strip() if m else None


def canonical_url_for(page: str) -> str:
    """URL kanoniczny wynikający z nazwy pliku (cleanUrls w vercel.json)."""
    slug = page[: -len(".html")]
    return BASE_URL + "/" if slug == "index" else f"{BASE_URL}/{slug}"


# ---------------------------------------------------------------- head / meta


def check_head(page: str, html: str) -> None:
    title = attr(html, r"<title>(.*?)</title>")
    if not title:
        err(page, "brak <title>")
    else:
        n = len(title)
        if n < TITLE_MIN or n > TITLE_MAX:
            warn(page, f"title ma {n} znaków (cel {TITLE_MIN}–{TITLE_MAX}): {title[:70]}")

    desc = attr(html, r'<meta\s+name="description"\s+content="([^"]*)"')
    if desc is None:
        err(page, "brak meta description")
    else:
        n = len(desc)
        if n < DESC_MIN or n > DESC_MAX:
            warn(page, f"meta description ma {n} znaków (cel {DESC_MIN}–{DESC_MAX})")

    canonical = attr(html, r'<link\s+rel="canonical"\s+href="([^"]*)"')
    expected = canonical_url_for(page)
    if not canonical:
        err(page, "brak rel=canonical")
    else:
        if canonical.endswith(".html"):
            err(page, f"canonical z sufiksem .html: {canonical}")
        if canonical.rstrip("/") != expected.rstrip("/"):
            warn(page, f"canonical {canonical} ≠ oczekiwany {expected}")

    og_url = attr(html, r'<meta\s+property="og:url"\s+content="([^"]*)"')
    if og_url and canonical and og_url.rstrip("/") != canonical.rstrip("/"):
        err(page, f"og:url ({og_url}) ≠ canonical ({canonical})")


# ---------------------------------------------------------------- JSON-LD


def check_jsonld(page: str, html: str) -> None:
    blocks = re.findall(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S | re.I
    )
    for i, raw in enumerate(blocks, 1):
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            err(page, f"JSON-LD #{i} niepoprawny: {exc}")
            continue
        for node in data if isinstance(data, list) else [data]:
            if isinstance(node, dict) and str(node.get("@id", "")).endswith(".html"):
                err(page, f"JSON-LD #{i}: @id z sufiksem .html ({node['@id']})")


# ---------------------------------------------------------------- placeholdery


def check_placeholders(page: str, html: str) -> None:
    for token in re.findall(r"PLACEHOLDER_[A-Z_]+|GTM-PLACEHOLDER", html):
        err(page, f"niewypełniony placeholder: {token}")


# ---------------------------------------------------------------- sitemap


def check_sitemap(pages: list[str]) -> None:
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    listed = {u.strip().rstrip("/") for u in re.findall(r"<loc>(.*?)</loc>", sitemap)}

    for page in pages:
        url = canonical_url_for(page).rstrip("/")
        if url not in listed:
            err("sitemap.xml", f"brak wpisu dla /{page}")

    known = {canonical_url_for(p).rstrip("/") for p in pages}
    for url in sorted(listed - known):
        err("sitemap.xml", f"wpis wskazuje na nieistniejącą stronę: {url}")

    for page in EXCLUDED:
        if canonical_url_for(page).rstrip("/") in listed:
            err("sitemap.xml", f"{page} nie powinno być w sitemapie")


# ---------------------------------------------------------------- linki


def check_internal_links(page: str, html: str) -> None:
    for href in re.findall(r'href="(/[^"#?]*)[^"]*"', html):
        target = href.strip("/")
        if not target:  # "/" -> index.html
            continue
        candidates = [
            ROOT / target,
            ROOT / f"{target}.html",
            ROOT / target / "index.html",
        ]
        if any(c.exists() for c in candidates):
            continue
        # linki obsłużone przez redirecty w vercel.json są OK
        if is_redirected(href):
            continue
        err(page, f"martwy link wewnętrzny: {href}")


_redirect_sources: set[str] | None = None


def is_redirected(href: str) -> bool:
    global _redirect_sources
    if _redirect_sources is None:
        try:
            cfg = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))
            _redirect_sources = {r["source"] for r in cfg.get("redirects", [])}
        except (OSError, json.JSONDecodeError, KeyError):
            _redirect_sources = set()
    if href in _redirect_sources:
        return True
    return any(
        src.endswith("/:path*") and href.startswith(src[: -len("/:path*")])
        for src in _redirect_sources
    )


# ---------------------------------------------------------------- Tailwind


TAILWIND_HINT = re.compile(
    r"^(sm:|md:|lg:|xl:|hover:|focus:|group-hover:)*"
    r"(bg|text|border|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|max-w|min-h|"
    r"flex|grid|gap|space|rounded|shadow|font|leading|tracking|items|justify|"
    r"col|row|z|opacity|top|bottom|left|right|inset|order|overflow|whitespace)"
    r"(-|$)"
)


def css_escape(cls: str) -> str:
    return re.sub(r"([.:/\[\]()#%!,])", lambda m: "\\" + m.group(1), cls)


def check_tailwind_coverage(pages: list[Path]) -> None:
    css_path = ROOT / "output.css"
    if not css_path.exists():
        err("output.css", "plik nie istnieje — uruchom tools/build-css.sh")
        return
    css = css_path.read_text(encoding="utf-8")

    missing: dict[str, set[str]] = {}
    for path in pages:
        html = path.read_text(encoding="utf-8")
        inline_styles = " ".join(re.findall(r"<style>(.*?)</style>", html, re.S))
        used: set[str] = set()
        for value in re.findall(r'class="([^"]+)"', html):
            used |= set(value.split())
        for cls in used:
            if not TAILWIND_HINT.match(cls):
                continue  # klasa własna, nie utility Tailwinda
            selector = "." + css_escape(cls)
            if selector in css or cls in inline_styles:
                continue
            missing.setdefault(rel(path), set()).add(cls)

    for page, classes in sorted(missing.items()):
        err(
            page,
            "klasy Tailwind użyte w HTML, ale nieobecne w output.css "
            f"({', '.join(sorted(classes))}) — sprawdź content w tailwind.config.js "
            "i przebuduj CSS",
        )


# ---------------------------------------------------------------- main


def main() -> int:
    quiet = "--quiet" in sys.argv
    paths = html_files()
    pages = [rel(p) for p in paths if rel(p) not in EXCLUDED]

    for path in paths:
        page = rel(path)
        html = path.read_text(encoding="utf-8")
        check_placeholders(page, html)
        check_internal_links(page, html)
        if page in EXCLUDED:
            continue
        check_head(page, html)
        check_jsonld(page, html)

    check_sitemap(pages)
    check_tailwind_coverage(paths)

    if not quiet:
        print(f"Sprawdzono {len(paths)} plików HTML.\n")

    if warnings:
        print(f"OSTRZEŻENIA ({len(warnings)}) — nie blokują deployu:")
        for w in warnings:
            print(f"  ! {w}")
        print()

    if errors:
        print(f"BŁĘDY ({len(errors)}):")
        for e in errors:
            print(f"  ✗ {e}")
        return 1

    print("OK — brak błędów blokujących.")
    return 0


if __name__ == "__main__":
    os.chdir(ROOT)
    sys.exit(main())
