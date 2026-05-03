# NET4ZERO — Nowa strona internetowa

**Status:** Etap 2 ukończony · Etap 3 — zakładanie kont
**Domena docelowa:** net4zero.pl (GoDaddy + Microsoft 365 dla poczty)
**Hosting docelowy:** Vercel (free tier)

---

## Stan plików

| Plik | Co to |
|---|---|
| `index.html` | **Strona główna** — single-page, gotowa produkcyjnie (z analytics + cookiebot + linkami do polityk) |
| `polityka-prywatnosci.html` | Polityka prywatności RODO v1.0 |
| `polityka-cookies.html` | Polityka cookies + lista cookies + Consent Mode v2 |
| `klauzula-rodo.html` | Klauzula informacyjna do formularzy |
| `sitemap.xml` | Mapa strony dla Google |
| `robots.txt` | Reguły dla crawlerów |
| `vercel.json` | Konfiguracja hostingu (security headers, redirecty, cache) |
| `.gitignore` | Pliki wykluczone z git |
| `logoPNG.png` | Logo NET4ZERO (do optymalizacji w Etapie 4) |
| `seo-keywords.md` | Lista słów kluczowych SEO |

---

## Etap 3 — Zakładanie kont (do zrobienia z Maciejem)

Założymy razem **8 kont** w tej kolejności (każde 5–10 min):

### 3.1 GitHub (free)
- Wejście: https://github.com/signup
- Mail: `biuro@net4zero.pl` (firmowy, nie prywatny)
- Username: `net4zero` lub `net4zero-pl`
- Po założeniu: utworzymy publiczne repo `net4zero-website`

### 3.2 Vercel (free Hobby)
- Wejście: https://vercel.com/signup
- **Login przez GitHub** (po założeniu GitHub w pkt 3.1)
- Po połączeniu: import repo, deploy na `*.vercel.app`

### 3.3 Google Tag Manager (free)
- Wejście: https://tagmanager.google.com
- Mail: `biuro@net4zero.pl`
- Container: `net4zero.pl`, target: Web
- Po założeniu: dostajemy ID `GTM-XXXXXXX` → wstawiam do kodu

### 3.4 Google Analytics 4 (free)
- Wejście: https://analytics.google.com
- Mail: `biuro@net4zero.pl`
- Property: `NET4ZERO`, strefa czasowa: Europe/Warsaw, waluta: PLN
- Po założeniu: dostajemy ID `G-XXXXXXXXXX` → konfigurujemy w GTM

### 3.5 Google Search Console (free)
- Wejście: https://search.google.com/search-console
- Property: `https://www.net4zero.pl/` (typ URL prefix)
- Weryfikacja przez meta tag: dostajemy token → wstawiam do `<head>`

### 3.6 Microsoft Clarity (free)
- Wejście: https://clarity.microsoft.com
- Mail: `biuro@net4zero.pl`
- Project: `net4zero.pl`
- Po założeniu: ID Clarity → wstawiam do kodu

### 3.7 Cookiebot CMP (free do 100 podstron)
- Wejście: https://www.cookiebot.com
- Mail: `biuro@net4zero.pl`
- Domain: `net4zero.pl`
- Po założeniu: CBID (Cookiebot ID) → wstawiam do kodu
- Konfiguracja kategorii zgód (Niezbędne / Statystyczne / Marketingowe)

### 3.8 Formspree (free do 50 leadów/mc)
- Wejście: https://formspree.io
- Mail: `biuro@net4zero.pl`
- 2 formularze: `lokalizacja` i `inwestor`
- Endpointy → wstawiam jako `action` w `<form>`
- Leady dostarczane na biuro@net4zero.pl

---

## Etap 4 — Deploy na staging (po Etapie 3)

1. Push kodu z lokalnego folderu do GitHub
2. Vercel → Import project z GitHub
3. Pierwszy deploy: dostajemy URL `net4zero-website-XXXX.vercel.app`
4. Maciej testuje całą stronę na tym URL
5. Iteracja, jeśli coś trzeba poprawić

---

## Etap 5 — DNS GoDaddy → Vercel (krytyczne)

**⚠️ POCZTA MUSI DALEJ DZIAŁAĆ.** W GoDaddy są rekordy MX, SPF (TXT), DKIM, DMARC dla Microsoft 365 — **NIE RUSZAMY**.

Zmiany w GoDaddy DNS:
1. **Backup obecnych rekordów** — screenshot wszystkich DNS przed zmianą (ja przygotuję checklist)
2. **Rekord A** (`@` → IP): zmiana z obecnego na Vercel IP `76.76.21.21`
3. **Rekord CNAME** (`www` → host): zmiana na `cname.vercel-dns.com`
4. **NIE RUSZAMY:** rekordy MX (Microsoft mail), TXT z `v=spf1`, DKIM (`selector1._domainkey`, `selector2._domainkey`), DMARC (`_dmarc`)
5. Vercel → Settings → Domains → dodaj `net4zero.pl` i `www.net4zero.pl`
6. Czekamy 24–48h na propagację DNS
7. Test poczty + strony

---

## Etap 6 — Po go-live

- [ ] Submit `sitemap.xml` w Google Search Console
- [ ] Verification właściciela domeny w Search Console
- [ ] Test cookie banner (Polska, EN jeśli będzie)
- [ ] Test obu formularzy (czy lead dochodzi na biuro@)
- [ ] Lighthouse audit (cel: Performance 90+, SEO 95+, Accessibility 95+)
- [ ] Setup alertów (GA4, Clarity)
- [ ] Stara strona HubSpot — przekierowanie 301 lub wyłączenie
- [ ] Monitoring 2 tygodni: czy ruch rośnie, czy formularze działają, czy mail dochodzi

---

## Placeholdery do uzupełnienia w `index.html`

Po założeniu kont wymienię w kodzie 4 placeholdery:

| Placeholder | Co wstawić | Skąd |
|---|---|---|
| `PLACEHOLDER_GSC_VERIFICATION_TOKEN` | Token weryfikacyjny Search Console | GSC → Settings → Verification |
| `PLACEHOLDER_COOKIEBOT_CBID` | CBID (UUID) | Cookiebot dashboard |
| `GTM-PLACEHOLDER` | ID Tag Managera (2× w kodzie) | GTM → Workspace |
| `PLACEHOLDER_CLARITY_ID` | ID projektu Clarity | Clarity → Settings |

---

## Brief biznesowy (przypomnienie)

**Pozycjonowanie:** Pierwsza w Polsce sieć osiedlowych recyklomatów. Mentalny anchor: sieć osiedlowa typu InPost, NIE sklep.

**Dwie ścieżki:**
- **A** — SM/gminy/ZGL/szkoły dzierżawią NET4ZERO 30 m², pobierają czynsz od 300 zł brutto/mc, zostają IPZ (Innym Punktem Zbierającym)
- **B** — Inwestorzy kupują maszyny (Pakiet Operator: 10 maszyn). Zarabiają na: handling fee od operatora, powierzchni reklamowej, programach marek napojów. **Kaucja jest neutralna finansowo.**

**Dane firmy:** NET4ZERO Sp. z o.o., Aleje Jerozolimskie 109/70, 02-011 Warszawa · KRS 0001132236 · NIP 7011226958 · REGON 529901015.

---

## Trzy testy każdej decyzji

1. Czy zwiększa profesjonalny wizerunek pod B2B (samorząd / inwestor)?
2. Czy chroni anonimowość partnerów (producenci RVM, operatorzy, leasing)?
3. Czy zwiększa szansę na wypełnienie jednego z dwóch formularzy?
