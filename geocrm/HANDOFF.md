# HANDOFF — dokończenie i wdrożenie GeoCRM (dla Claude Code na komputerze)

> Ten dokument jest instrukcją przejęcia projektu przez **Claude Code uruchomionego
> lokalnie na komputerze** (z terminalem, `gh`, `git`, `npm`). Cel: dokończyć
> rozdzielenie repo i **wdrożyć GeoCRM na produkcję pod domeną `geocrm.pl`** (GoDaddy).
> Współpracownik: użytkownik może równolegle klikać panele przez **Claude w Chrome**.

---

## 0. Kontekst — co to jest i gdzie jest

- **GeoCRM** — SaaS CRM do zarządzania lokalizacjami recyklomatów NET4ZERO, oparty o mapy Google.
- Kod żyje w podkatalogu **`geocrm/`** repozytorium `net4zero-coder/net4zero-website`
  (reszta repo to strona marketingowa — nie ruszać).
- Gałąź robocza: **`claude/geocrm-saas-app-mwseuq`**, otwarty **PR #8** (draft) do `main`.
- Stack: Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Prisma/PostgreSQL ·
  Auth.js v5 (Credentials + RBAC 5 ról) · Google Maps (`@vis.gl/react-google-maps`) · Recharts.
- **Node 22**, npm. Build: `prisma generate && next build`.

### Co jest już zbudowane (11 commitów, build zielony, 24 trasy)
Dashboard · Mapa (markery wg statusu + regiony) · Lista CRM (szukanie/sort/filtry) ·
Karta lokalizacji (zakładki, notatki/kontakty inline) · pełny **CRUD lokalizacji + historia zmian** ·
Regiony rysowane na mapie + auto-przypisanie (point-in-polygon) · Geocoding + drag pinezki ·
Zadania (kanban) · Dokumenty · Handlowcy · Inwestorzy · **Umowy** · **Urządzenia** (kaucyjny) ·
Raporty + eksport CSV · Ustawienia (użytkownicy/role) · tryb jasny/ciemny · responsywność.

### Tryb demo
Bez `DATABASE_URL` aplikacja działa na danych przykładowych (logowanie `admin@net4zero.pl` / `demo1234`).
**Po ustawieniu `DATABASE_URL` tryb demo się wyłącza** — konta i dane pochodzą z bazy.

---

## 1. Zadania do wykonania (kolejność)

1. (Zalecane) **Rozdzielić repo** — utworzyć `net4zero-geocrm` i przenieść tam zawartość `geocrm/`.
2. **Baza** — Supabase (PostgreSQL) → `DATABASE_URL` + `DIRECT_URL`.
3. **Klucz Google Maps** → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
4. **Vercel** — projekt z Root Directory `geocrm` (lub `/` po rozdzieleniu) + zmienne środowiskowe.
5. **Domena `geocrm.pl`** (GoDaddy) → DNS na Vercel.
6. **Migracje + seed** — `prisma migrate deploy` + `npm run db:seed`.
7. **Weryfikacja** wg checklisty.

---

## 2. (Zalecane) Rozdzielenie repo

Użytkownik zdecydował o osobnym repozytorium produktu. Na komputerze możesz to zrobić przez `gh`:

```bash
# a) utwórz puste prywatne repo
gh repo create net4zero-coder/net4zero-geocrm --private --description "GeoCRM — SaaS map-based CRM (NET4ZERO)"

# b) przygotuj czysty katalog z zawartością geocrm/ jako root nowego repo
git clone https://github.com/net4zero-coder/net4zero-website.git /tmp/n4z
cd /tmp/n4z
git checkout claude/geocrm-saas-app-mwseuq
cp -R geocrm /tmp/geocrm-standalone
cd /tmp/geocrm-standalone
git init -b main
git add -A
git commit -m "chore: import GeoCRM as standalone repo"
git remote add origin https://github.com/net4zero-coder/net4zero-geocrm.git
git push -u origin main
```

Po tym w Vercel **Root Directory = `/`**. (Jeśli pomijasz rozdzielenie — zostaje `geocrm/`
w istniejącym repo, a w Vercel **Root Directory = `geocrm`**.)

> Uwaga: `geocrm/.gitignore` celowo NIE ignoruje `package.json`/`package-lock.json`
> (w repo-monorepo root `.gitignore` zakotwicza te ignory do roota). W osobnym repo nie ma tego problemu.

---

## 3. Baza — Supabase

1. https://supabase.com → New project (region **Europe (Frankfurt)**), zapisz Database Password.
2. **Connect → ORMs → Prisma**. Skopiuj:
   - `DATABASE_URL` = pooler (port **6543**), dopisz `?pgbouncer=true`.
   - `DIRECT_URL` = direct (port **5432**).
   - Podstaw hasło w miejsce `[YOUR-PASSWORD]`.

---

## 4. Klucz Google Maps

Google Cloud → włącz **Maps JavaScript API**, **Geocoding API**, **Places API** →
Credentials → API key → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
Ogranicz klucz do domen: `geocrm.pl`, `*.geocrm.pl`, `*.vercel.app`.
(Opcjonalnie Map ID → `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.)

---

## 5. Vercel — projekt i zmienne

1. Vercel → Add New → Project → import repo.
2. **Root Directory**: `geocrm` (monorepo) lub `/` (osobne repo). Framework: Next.js (auto).
3. Environment Variables (Production + Preview):

| Klucz | Wartość |
|---|---|
| `DATABASE_URL` | pooler z Supabase |
| `DIRECT_URL` | direct z Supabase |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://geocrm.pl` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | klucz z §4 |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Map ID (opcjonalnie) |

4. Deploy.

---

## 6. Domena `geocrm.pl` (GoDaddy → Vercel)

1. Vercel → Project → **Settings → Domains → Add** → dodaj **`geocrm.pl`** oraz **`www.geocrm.pl`**.
   Vercel pokaże dokładne rekordy DNS — **użyj wartości, które wyświetli** (poniżej typowe).
2. GoDaddy → **My Products → geocrm.pl → DNS → Manage DNS → Records**:
   - **Wyłącz Domain Forwarding / Parking**, jeśli aktywne.
   - **A** — Name `@` → Value **`76.76.21.21`** (apex; jeśli Vercel pokazuje inny adres, użyj tego z panelu), TTL 600.
   - **CNAME** — Name `www` → Value **`cname.vercel-dns.com`**, TTL 600.
   - Usuń stare rekordy A/CNAME wskazujące na parking GoDaddy dla `@` i `www`.
3. W Vercel ustaw **`geocrm.pl` jako Primary** (a `www.geocrm.pl` → Redirect do apex), lub odwrotnie.
4. Poczekaj na propagację (kilka–kilkadziesiąt min). Vercel sam wystawi certyfikat SSL.
5. Po podpięciu domeny upewnij się, że `AUTH_URL=https://geocrm.pl` i zrób **Redeploy**.

---

## 7. Migracje i dane startowe

Po podłączeniu bazy utwórz schemat i wgraj dane startowe. Najprościej lokalnie:

```bash
cd geocrm                    # lub katalog osobnego repo
cp .env.example .env         # wklej DATABASE_URL i DIRECT_URL (te same co w Vercel)
npm install
npx prisma migrate deploy    # tworzy tabele w Supabase
npm run db:seed              # organizacja NET4ZERO + użytkownicy 5 ról
```

Konta z seeda (hasło `demo1234` — **zmień po pierwszym logowaniu**):
`admin@net4zero.pl` (ADMIN), `manager@net4zero.pl`, `darek@net4zero.pl` (SALES),
`adam@net4zero.pl` (SALES), `inwestor@net4zero.pl` (INVESTOR), `serwis@net4zero.pl` (SERVICE).

> Alternatywnie utwórz nowe konto administratora przez `/register` (zakłada nową organizację).

---

## 8. Weryfikacja po wdrożeniu (na `https://geocrm.pl`)

- [ ] Strona ładuje się po HTTPS, certyfikat OK.
- [ ] `/login` — logowanie kontem z bazy działa (tryb demo już wyłączony).
- [ ] `/dashboard` — KPI (na start z seeda), wykresy renderują.
- [ ] `/map` — markery Google widoczne, kolory wg statusu, regiony jako nakładki.
- [ ] `/locations/new` — wyszukanie adresu ustawia pinezkę (Geocoding), pinezkę da się przeciągnąć.
- [ ] `/locations/[id]` → Edytuj → zmiana pola zapisuje wpis w zakładce Historia.
- [ ] `/regions` — narysowanie obszaru zapisuje region.
- [ ] `/tasks`, `/documents`, `/contracts`, `/devices` — dodawanie/zmiana statusu działają.
- [ ] `/reports` — eksport CSV pobiera plik.
- [ ] `/settings` — dodanie użytkownika i zmiana roli działają (jako ADMIN).

---

## 9. Gotchas / uwagi techniczne

- **Tryb demo wyłącza się** automatycznie, gdy ustawione `DATABASE_URL`. Bez bazy działają dane demo.
- Build wymaga `prisma generate` (jest w skrypcie `build`). Node 22.
- Auth.js v5 (beta) — sesje JWT + Credentials; `AUTH_SECRET` i `AUTH_URL` wymagane na produkcji.
- Prisma: `DATABASE_URL` = pooler (runtime), `DIRECT_URL` = direct (migracje).
- `DrawingManager` Google jest zdeprecjonowany — rysowanie regionów zrobione ręcznie (klik-punkty), nie zmieniać na DrawingManager.
- Eksport PDF z polskimi znakami wymaga osadzenia fontu Unicode w jsPDF — dlatego na teraz jest CSV (BOM + `;`, otwiera się w Excelu PL). PDF/XLSX to zadanie na później.

## 10. Co jeszcze zostało (opcjonalne, po wdrożeniu)

Kalendarz i cele handlowców (modele `CalendarEvent`/`SalesGoal` gotowe) · fizyczny upload plików
(Supabase Storage/S3 — zmienne w `.env.example`) · powiadomienia e-mail (SMTP/Brevo) ·
eksport PDF/XLSX · telemetria urządzeń · import granic TERYT dla regionów predefiniowanych.

## 11. Przydatne komendy

```bash
npm run dev            # dev server (localhost:3000)
npm run build          # build produkcyjny (prisma generate + next build)
npm run typecheck      # kontrola typów
npm run prisma:studio  # podgląd bazy
npm run db:seed        # dane startowe
```

Dokumentacja: `README.md` · `ARCHITECTURE.md` · `DEPLOY.md` · `ROADMAP.md`.
