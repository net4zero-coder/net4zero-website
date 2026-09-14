---
description: Audyt SEO/GEO strony lub całego serwisu z listą poprawek
argument-hint: [plik.html | całość]
allowed-tools: Read, Glob, Grep, Bash(python3 tools/check-site.py:*), Bash(git log:*), Bash(git diff:*)
---

Zakres audytu: **$ARGUMENTS** (jeśli puste — cały serwis).

1. Odpal `python3 tools/check-site.py` i weź jego wynik jako punkt wyjścia.
   Nie powtarzaj ręcznie tego, co on już sprawdza (długości meta, canonical,
   og:url, JSON-LD, sitemap, martwe linki, pokrycie klas Tailwind).

2. Dołóż to, czego skrypt nie sprawdzi — czyli warstwę jakościową:
   - **Intencja wyszukiwania:** czy treść odpowiada na to, czego szuka
     zarząd SM / urzędnik / inwestor, czy tylko opisuje firmę?
   - **Kanibalizacja:** które strony biją się o to samo zapytanie.
   - **Linkowanie wewnętrzne:** strony-sieroty, brakujące linki kontekstowe
     między landingami miejskimi, słownikiem i artykułami.
   - **GEO:** czy `llms.txt` / `llms-full.txt` zawierają fakty z audytowanych
     stron w formie, którą LLM zacytuje (konkret + podstawa prawna).
   - **Zgodność prawna treści:** czy przywołane artykuły ustaw i numery Dz.U.
     zgadzają się z tym, co jest w `CLAUDE.md` sekcja 4.
   - **Baseline:** porównaj z `seo-baseline/` — które strony miały ruch,
     a od tego czasu straciły linkowanie lub zostały przepisane.

3. Wynik podaj jako tabelę: `priorytet | strona | problem | konkretna poprawka`.
   Priorytety P1/P2/P3, posortowane. Bez ogólników typu „popraw treść" —
   każda pozycja ma mówić, co dokładnie zmienić.

Nie wprowadzaj zmian. To audyt — decyzję o wdrożeniu podejmuję ja.
