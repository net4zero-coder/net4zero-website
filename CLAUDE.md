# CLAUDE.md — instrukcja pracy nad net4zero.pl

Ten plik czyta Claude na starcie **każdej** sesji (CLI, web, IDE). Dzięki niemu
nie trzeba za każdym razem tłumaczyć od zera kontekstu biznesowego, konwencji
SEO ani tego, czego nie wolno ruszać.

---

## 1. Czym jest to repo

Statyczna strona `www.net4zero.pl` — czysty HTML + Tailwind, hostowana na Vercel
(free tier), deploy automatyczny z gałęzi `main`. **Nie ma frameworka, nie ma
build stepu na Vercelu.** Vercel serwuje pliki tak, jak leżą w repo.

| Element | Gdzie |
|---|---|
| Strona główna (single-page) | `index.html` |
| Landingi segmentowe | `dla-gmin.html`, `dla-spoldzielni.html`, `dla-mieszkancow.html`, `pakiet-miasto.html` |
| Artykuły / hub wiedzy | `wiedza.html` + ~15 artykułów w roocie |
| Landingi miejskie | `system-kaucyjny-{warszawa,krakow,wroclaw,poznan,lodz}.html` |
| Słownik pojęć | `slownik/*.html` |
| Style | `src/input.css` → **`output.css`** (commitowany, budowany lokalnie) |
| Konfiguracja hostingu | `vercel.json` (headers, 301, `cleanUrls: true`) |
| Lead capture | `api/lead.js` (Vercel Function → Brevo) |
| Warstwa GEO/AI | `llms.txt`, `llms-full.txt` |
| Kontekst SEO | `seo-baseline/` (snapshoty GSC) |

`package.json` jest celowo w `.gitignore` — Vercel ma widzieć projekt jako
w 100% statyczny. Tailwind uruchamiamy przez `npx` z przypiętą wersją.

---

## 2. Komendy

```bash
python3 tools/check-site.py     # walidator: SEO, linki, sitemap, JSON-LD, CSS
tools/build-css.sh              # przebudowa output.css + walidacja
```

**Zasada:** `check-site.py` musi kończyć się kodem 0 przed każdym pushem.
Ostrzeżenia (długości title/description) nie blokują — błędy tak.
Ten sam walidator chodzi w GitHub Actions na każdym PR.

---

## 3. Konwencje, których trzeba pilnować

### URL-e i canonical
- `cleanUrls: true` — publiczny URL **nigdy nie ma sufiksu `.html`**.
  Plik `dla-gmin.html` → URL `https://www.net4zero.pl/dla-gmin`.
- Domena kanoniczna to `www.net4zero.pl` (bez `www` → 301 na `www`).
- `rel=canonical`, `og:url` i `@id` w JSON-LD muszą być identyczne i bez `.html`.
- Usuwasz albo zmieniasz nazwę strony → **dopisz 301 w `vercel.json`**.
  Zombie URL-e z czasów HubSpota są tam już obsłużone; nie kasuj tych wpisów.

### SEO / GEO
- `<title>`: 30–65 znaków, schemat `Temat — doprecyzowanie | NET4ZERO`.
- `meta description`: 120–160 znaków, po polsku, z konkretem (liczba, data,
  numer artykułu ustawy), bez pustych obietnic.
- Każda nowa podstrona: wpis w `sitemap.xml` **i** link z `wiedza.html`
  lub z odpowiedniego landingu — sierot nie zostawiamy.
- Artykuły mają `BreadcrumbList` w JSON-LD, breadcrumb prowadzi do `/wiedza`
  (nie do `/#wiedza`).
- Dodajesz merytorykę o systemie kaucyjnym → zaktualizuj `llms.txt`
  i `llms-full.txt`. To jest warstwa pod odpowiedzi LLM-ów, nie ozdobnik.

### Tailwind
- Klasy działają tylko, jeśli plik jest objęty `content` w `tailwind.config.js`
  (obecnie `./*.html` i `./slownik/*.html`). Nowy katalog z HTML → dopisz glob.
- Po dodaniu nowych klas **zawsze** `tools/build-css.sh`. `output.css` jest
  commitowany; niezbudowany CSS = rozjechany layout na produkcji.
  Walidator to wykrywa (sprawdza pokrycie klas w `output.css`).

### Zgody i prywatność
- Consent Mode v2 z `default: denied` + Cookiebot CMP — musi być na **każdej**
  podstronie z analityką. Nie dodawaj skryptów śledzących poza GTM.
- GTM: `GTM-NWN45P2K`. Analytics konfigurujemy w GTM, nie w kodzie strony.
- Formularze linkują do `/klauzula-rodo` (nie `/rodo` — to już tylko 301).

---

## 4. Kontekst biznesowy (potrzebny przy pisaniu treści)

NET4ZERO Sp. z o.o. — pierwsza w Polsce sieć **osiedlowych** recyklomatów (RVM)
w systemie kaucyjnym. Anchor mentalny: sieć osiedlowa typu InPost, **nie sklep**.

Dwie ścieżki sprzedażowe:
- **A — lokalizacja (SM / gmina / ZGL / szkoła):** dzierżawi NET4ZERO 5–30 m²,
  pobiera czynsz od 300 zł brutto/mc, zostaje IPZ (Innym Punktem Zbierającym).
  **Lokalizacja nie wykłada CAPEX.**
- **B — inwestor:** kupuje maszyny (Pakiet Operator: 10 maszyn). Zarabia na
  handling fee od operatora, powierzchni reklamowej i programach marek.
  **Kaucja jest neutralna finansowo** — to nie jest źródło przychodu.

Ramy prawne, do których odwołujemy się w treściach:
- IPZ — art. 40g ustawy o gospodarce opakowaniami (Dz.U. 2025 poz. 870).
- Stawki kaucji — Rozporządzenie MKiŚ z 08.07.2024 (Dz.U. 2024 poz. 1046):
  0,50 zł PET/metal, 1,00 zł szkło.
- System obowiązuje od 01.10.2025 (PET ≤3 L, metal ≤1 L),
  od 01.01.2026 szkło wielorazowe ≤1,5 L.
- Zwolnienie z BDO dla IPZ — art. 45 ust. 1 pkt 1 i 13 ustawy o odpadach.
- Rejestracja w CBDOK leży po stronie operatora, nie IPZ.

**Anonimowość partnerów:** nie wymieniamy z nazwy producentów RVM, operatorów
systemu kaucyjnego (z którymi mamy umowy) ani firm leasingowych. To świadoma
decyzja, nie przeoczenie.

Trzy testy każdej zmiany na stronie:
1. Czy zwiększa profesjonalny wizerunek pod B2B (samorząd / inwestor)?
2. Czy chroni anonimowość partnerów?
3. Czy zwiększa szansę na wypełnienie jednego z formularzy?

---

## 5. Czego nie ruszamy

- **DNS w GoDaddy:** rekordy MX, SPF (`v=spf1`), DKIM (`selector1/2._domainkey`),
  DMARC (`_dmarc`) obsługują pocztę Microsoft 365. Zmiana = firma traci maila.
- **Sekrety:** `BREVO_API_KEY`, `BREVO_LIST_ID` żyją w Vercel Env Vars.
  Nigdy w repo, nigdy w treści PR-a, nigdy w logach.
- **Redirecty w `vercel.json`** — usunięcie wpisu ożywia zombie URL i psuje SEO.
- **`seo-baseline/`** — snapshoty historyczne, tylko do odczytu, nie nadpisujemy.
- Pliki robocze SEO (`seo-keywords.md`, `seo-strategia-90dni.md` itd.) są
  w `.gitignore` — repo jest **publiczne**, one zostają lokalnie.

---

## 6. Jak pracujemy

1. Gałąź od `main` (`fix/...`, `feat/...`, `content/...`).
2. Zmiana → `python3 tools/check-site.py` → 0 błędów.
3. Commit w konwencji `typ(zakres): opis` po polsku
   (`feat(seo)`, `fix(consent)`, `content(slownik)`, `chore(infra)`).
4. Push + draft PR. GitHub Actions odpala walidator, Vercel buduje preview.
5. Merge do `main` = deploy produkcyjny. Nie pushujemy bezpośrednio na `main`.

Gotowe skróty w `.claude/commands/`: `/artykul`, `/audyt-seo`, `/przed-deployem`.
