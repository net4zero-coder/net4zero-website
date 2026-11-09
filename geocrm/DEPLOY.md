# Wdrożenie GeoCRM — instrukcja krok po kroku

Ta instrukcja doprowadza GeoCRM od repo do działającej aplikacji na własnej
domenie. Jest napisana tak, aby mógł ją wykonać człowiek **lub** asystent
klikający po panelach (np. Claude w Chrome). Sekrety wpisujesz bezpośrednio
w panelu Vercel — nie trzeba ich nigdzie kopiować „na boku".

Kolejność: **Baza → (repo) → Vercel → Zmienne → Migracje → Domena**.

---

## 0. Wymagania wstępne
- Konto GitHub (repo z kodem GeoCRM).
- Konto Vercel (darmowe) — https://vercel.com.
- Konto Supabase (darmowe) — https://supabase.com (baza PostgreSQL).
- Konto Google Cloud — https://console.cloud.google.com (klucz Map).

---

## 1. Baza danych — Supabase
1. Zaloguj się do Supabase → **New project**.
2. Nazwa: `net4zero-geocrm`, ustaw silne **Database Password**, region: **Europe (Frankfurt)** (blisko PL).
3. Poczekaj aż projekt się utworzy (~2 min).
4. Wejdź w **Connect** (górny pasek) → sekcja **App Frameworks / Connection string** → **Prisma** (lub „ORMs”).
5. Skopiuj dwa adresy:
   - **Transaction pooler** (port `6543`) → to będzie `DATABASE_URL` (dopisz na końcu `?pgbouncer=true`).
   - **Direct connection** (port `5432`) → to będzie `DIRECT_URL`.
   - W obu wstaw swoje hasło w miejsce `[YOUR-PASSWORD]`.

Przykład:
```
DATABASE_URL="postgresql://postgres.xxxx:HASLO@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:HASLO@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

---

## 2. Klucz Google Maps
1. Google Cloud Console → utwórz/wybierz projekt.
2. **APIs & Services → Enable APIs** — włącz: **Maps JavaScript API**, **Geocoding API**, **Places API**.
3. **Credentials → Create credentials → API key**. Skopiuj klucz → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
4. (Zalecane) Ogranicz klucz: *Application restrictions → Websites* → dodaj swoją domenę i `*.vercel.app`.
5. (Opcjonalnie, dla ładniejszych markerów) **Map Management → Create Map ID** (typ: JavaScript, Vector) → `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.

---

## 3. Repozytorium
GeoCRM żyje w podkatalogu `geocrm/`. Dwie opcje:
- **A) Osobne repo** (zalecane): utwórz `net4zero-geocrm` (Private) i przenieś do jego roota zawartość `geocrm/`. W Vercel Root Directory = `/`.
- **B) To samo repo**: zostaw w `geocrm/`. W Vercel Root Directory = `geocrm`.

---

## 4. Projekt na Vercel
1. Vercel → **Add New… → Project** → zaimportuj repo z GitHub.
2. **Root Directory**: `geocrm` (opcja B) lub `/` (opcja A). *(Framework: Next.js — wykryje automatycznie.)*
3. Build Command: domyślny `next build` (nasz `package.json` uruchamia też `prisma generate`).
4. **Nie klikaj jeszcze Deploy** — najpierw zmienne (krok 5).

---

## 5. Zmienne środowiskowe (Vercel → Settings → Environment Variables)
Dodaj (Environment: **Production** i **Preview**):

| Klucz | Wartość |
|---|---|
| `DATABASE_URL` | pooler string z Supabase (krok 1) |
| `DIRECT_URL` | direct string z Supabase (krok 1) |
| `AUTH_SECRET` | wygeneruj: `openssl rand -base64 32` |
| `AUTH_URL` | `https://<twoja-domena>` (na start URL z Vercel) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | klucz z kroku 2 |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Map ID (opcjonalnie) |

Kliknij **Deploy**.

> Uwaga: gdy ustawisz `DATABASE_URL`, aplikacja wychodzi z trybu demo — logowanie
> demo przestaje działać, konta pochodzą z bazy (patrz krok 6).

---

## 6. Migracje i dane startowe
Po pierwszym deployu utwórz schemat w bazie. Najprościej **lokalnie** (jednorazowo):

```bash
cd geocrm
cp .env.example .env          # wklej DATABASE_URL i DIRECT_URL z Supabase
npm install
npx prisma migrate deploy     # tworzy tabele
npm run db:seed               # organizacja NET4ZERO + użytkownicy ról
```

Konta z seeda (hasło `demo1234`): `admin@net4zero.pl` (ADMIN), `manager@net4zero.pl`,
`darek@net4zero.pl` (SALES), `inwestor@net4zero.pl` (INVESTOR), `serwis@net4zero.pl` (SERVICE).
**Zmień hasła po pierwszym logowaniu** (lub użyj własnej rejestracji na `/register`).

> Alternatywa bez lokalnego terminala: uruchom `prisma migrate deploy` z panelu
> Supabase (SQL) lub jako jednorazowy skrypt — ale ścieżka lokalna jest najprostsza.

---

## 7. Domena `geocrm.pl` (GoDaddy → Vercel)
1. Vercel → projekt → **Settings → Domains → Add** → dodaj `geocrm.pl` i `www.geocrm.pl`.
   Vercel wyświetli dokładne rekordy DNS — użyj tych wartości (poniżej typowe).
2. GoDaddy → **geocrm.pl → DNS → Manage DNS**:
   - Wyłącz Domain Forwarding/Parking, jeśli aktywne.
   - **A** `@` → `76.76.21.21` (apex; jeśli Vercel pokazuje inny — użyj z panelu), TTL 600.
   - **CNAME** `www` → `cname.vercel-dns.com`, TTL 600.
   - Usuń stare rekordy parkingu GoDaddy dla `@` i `www`.
3. W Vercel ustaw `geocrm.pl` jako Primary (www → redirect do apex). SSL wystawi się automatycznie.
4. Po propagacji ustaw `AUTH_URL=https://geocrm.pl` i zrób **Redeploy**.

---

## 8. Weryfikacja po wdrożeniu
- [ ] `/login` — logowanie kontem z bazy działa.
- [ ] `/dashboard` — KPI liczą się z bazy (na start 0/seed).
- [ ] `/map` — mapa Google renderuje markery (klucz działa).
- [ ] `/locations/new` — geocoding adresu ustawia pinezkę.
- [ ] `/regions` — rysowanie obszaru zapisuje region.
- [ ] `/reports` — eksport CSV pobiera plik.

---

## 9. Opcjonalne (rozszerzenia)
- **Storage plików** (dokumenty): Supabase Storage (bucket `geocrm-documents`) lub AWS S3 —
  zmienne `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` / `AWS_*` (patrz `.env.example`).
- **E-mail** (reset hasła, powiadomienia zadań): SMTP (np. Brevo) — zmienne `SMTP_*`, `EMAIL_FROM`.

---

## Szybka ścieżka (TL;DR)
1. Supabase → projekt → skopiuj `DATABASE_URL` + `DIRECT_URL`.
2. Google Cloud → włącz 3 API → skopiuj klucz Maps.
3. Vercel → import repo → Root Directory `geocrm` → wklej zmienne → Deploy.
4. Lokalnie: `prisma migrate deploy` + `npm run db:seed`.
5. Dodaj domenę w Vercel, zaktualizuj `AUTH_URL`, Redeploy.
