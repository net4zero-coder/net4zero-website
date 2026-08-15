---
description: Nowy artykuł SEO/GEO zgodny z konwencjami net4zero.pl
argument-hint: <temat artykułu> [słowo kluczowe]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(python3 tools/check-site.py:*), Bash(tools/build-css.sh)
---

Napisz nowy artykuł na temat: **$ARGUMENTS**

Kolejność pracy — nie pomijaj kroków:

1. **Wzorzec.** Przeczytaj `anatomia-wdrozenia-recyklomatu.html` — to referencyjna
   struktura artykułu (head, breadcrumb, JSON-LD, sekcje, CTA, stopka). Nowy plik
   ma być spójny z nim wizualnie i strukturalnie, nie wymyślaj nowego layoutu.

2. **Kanibalizacja.** Sprawdź (Grep po `<title>` i `<h1>`), czy tematu nie
   pokrywa już istniejąca strona lub hasło w `slownik/`. Jeśli pokrywa —
   zaproponuj rozbudowę istniejącej zamiast nowego pliku i zapytaj, zanim
   utworzysz plik.

3. **Plik.** Nazwa `kebab-case.html` w roocie (artykuł) albo `slownik/` (hasło
   słownikowe). URL bez `.html` — zgodnie z `cleanUrls`.

4. **Head.** `<title>` 30–65 znaków w schemacie `Temat — doprecyzowanie | NET4ZERO`,
   `meta description` 120–160 znaków z konkretem, `rel=canonical` + `og:url`
   identyczne i bez `.html`.

5. **JSON-LD.** `Article` + `BreadcrumbList` (breadcrumb do `/wiedza`, nie `/#wiedza`).
   `@id` bez sufiksu `.html`.

6. **Treść.** Po polsku, pod odbiorcę B2B (zarząd SM, urzędnik, inwestor).
   Każda teza prawna z konkretną podstawą (artykuł ustawy + Dz.U.).
   Nie wymieniaj z nazwy producentów RVM, operatorów ani firm leasingowych.
   Kaucja jest neutralna finansowo — nigdy nie sugeruj, że to źródło przychodu.

7. **Wpięcie w serwis.** Dopisz wpis do `sitemap.xml` i link z `wiedza.html`
   (lub z właściwego landingu). Artykuł bez linku wewnętrznego to sierota.

8. **Warstwa GEO.** Jeśli artykuł wnosi nową merytorykę o systemie kaucyjnym —
   dopisz ją do `llms.txt` i `llms-full.txt`.

9. **Walidacja.** Uruchom `python3 tools/check-site.py`. Jeśli zgłosi brakujące
   klasy Tailwind — `tools/build-css.sh`. Kończ dopiero przy zerze błędów.

Na koniec pokaż mi: URL nowej strony, `<title>`, `meta description` z licznikiem
znaków oraz listę miejsc, z których na nią linkujemy.
