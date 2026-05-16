# SEO Baseline — GSC snapshot 2026-05-16

Snapshot Google Search Console przed publikacją sweep'a treści (22 nowe podstrony).

## Kontekst

**Data wykonania:** 16.05.2026, wieczór
**Property GSC:** Domain property `net4zero.pl` (DNS TXT verified 04.05.2026)
**Zakres danych:** Last 28 days (faktycznie 4.05 – 14.05.2026, 12 dni rzeczywistych danych — GSC zaczął zbierać dopiero po weryfikacji DNS)

## Pliki

| Plik | Co zawiera |
|---|---|
| `gsc-queries-baseline-2026-05-16.csv` | Top 10 zapytań (wszystkie z >0 impressions) |
| `gsc-pages-baseline-2026-05-16.csv` | Top 16 stron (wszystkie z >0 impressions) |

## Główne liczby (28 dni)

- Łączne kliknięcia: **28**
- Łączne wyświetlenia: **145**
- Średni CTR: **19,3%**
- Średnia pozycja: **7,3**

## Porównanie 7d vs poprzednie 7d

| Metryka | Last 7d | Prev 7d | Zmiana |
|---|---|---|---|
| Kliknięcia | 20 | 8 | +150% |
| Wyświetlenia | 105 | 40 | +162% |
| CTR | 19% | 20% | -1pp |
| Pozycja | 8.2 | 5.1 | +3.1 (gorzej) |

Pozycja pogorszyła się bo dochodzą nowe, słabsze long-tail queries. Zdrowy znak rozszerzania zasięgu.

## Indeksacja (Pages report)

- **Zindeksowane:** 13
- **Niezindeksowane:** 22
- **Łącznie znanych Google:** 35

### Breakdown niezindeksowanych:
- 6 — Strona zawiera przekierowanie (OK, redirect działa)
- 3 — Nie znaleziono (404) → kandydaci do fix w `vercel.json`
- 1 — Błąd przekierowania → do zbadania
- 1 — Strona wykluczona za pomocą "noindex" (prawdopodobnie celowe — np. dziękujemy)
- 9 — Zeskanowane ale nie zindeksowane (czeka na crawl)
- 2 — Wykryte ale nie zindeksowane (czeka na crawl)

## Filtry pokazane:

- `/slownik/` — **0 kliknięć, 0 wyświetleń** = czysty before
- `/dla-` — **0 kliknięć, 0 wyświetleń** = czysty before
- `/hubfs/` — 3 URL-e (TS.pdf, PP.pdf × 2) — wszystkie 404 obecnie → kandydaci do 301 fix

## Top queries — obserwacje

1. `net4zero` (14 clicks, pos 1.4) — brand search, mocny
2. `sustainability consulting` (15 impr, 0 clicks, pos 11.2) — angielski long-tail, ruch międzynarodowy
3. `cbdok` (3 impr, pos 4.3) — pasuje do `/slownik/cbdok` (świeży, jutro powinien podskoczyć)
4. `ipz 266` (1 impr, pos 36) — long-tail prawny, ciekawe; po zaindeksowaniu `/slownik/ipz` powinniśmy się przesunąć
5. `systemy antyfraudowe` (3 impr, pos 53.3) — mamy `/11-dobrych-praktyk-antyfraudowych`, ale pozycja słaba

## Top pages — obserwacje

1. `www.net4zero.pl/` (15 clicks) — homepage dominuje
2. `net4zero.pl/` (7 clicks) — duplikat non-www; redirect 308 działa, Google sam się skonsoliduje w 2-4 tyg
3. `net4zero.pl/hubfs/TS.pdf` (2 clicks, pozycja 5.6) — **stary HubSpot, 404 obecnie** → fix priorytetowy
4. `/recyklomat-spoldzielnia-ipz` (2 clicks, pos 11.4) — flagship article SM, dobra pozycja
5. `/klauzula-rodo` (1 click, pos 2.7) — RODO, wysoka pozycja (cytat prawny)

## Plan po publikacji sweep'a (16.05.2026)

### Wykonane dziś:
- ✅ Sitemap zweryfikowana (36 URL-i, GSC widzi cache 15 — zaktualizuje w 24-48h)
- ✅ Request indexing dla 5 priorytetowych URL-i (wiedza, dla-spoldzielni, dla-gmin, pakiet-miasto, dla-mieszkancow)
- ✅ Baseline CSV zapisany w tym folderze

### Jutro (17.05):
- Request indexing dla kolejnych 5 URL-i (limit GSC ~10/dzień)
- Rich Results Test dla 5 priorytetowych podstron (Krok 5)
- Bing Webmaster Tools setup (Krok 6)

### Najbliższe dni:
- Fix `vercel.json` — 301 redirecty dla `/hubfs/TS.pdf`, `/hubfs/PP.pdf`, `*.html` (osobny commit)
- Audit pozostałych 6 redirect + 1 redirect error
- Monitoring: za 7 i 14 dni — porównanie z tym baseline

## Pomiary do śledzenia

Co tydzień zapisać:
- Łączne clicks/impressions w GSC (Last 7d)
- Średnia pozycja
- Liczba zindeksowanych URL-i
- CTR
- Nowy filtr `/slownik/` i `/dla-` — kiedy się obudzi (powinno w ~14 dni)
