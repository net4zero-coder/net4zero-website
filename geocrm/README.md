# GeoCRM — NET4ZERO

SaaS klasy CRM do zarządzania **lokalizacjami recyklomatów** (automatów kaucyjnych),
inwestorami, operatorami, handlowcami i regionami sprzedaży. **Mapa Google jest
centrum całego systemu**; lista lokalizacji jest jej uzupełnieniem.

> Status: **fundament (Etapy 1–4, 6–8 w rdzeniu)** — architektura, baza, autoryzacja,
> dashboard, mapa, lista CRM i karta lokalizacji. Kolejne moduły w [ROADMAP.md](./ROADMAP.md).

---

## Stack technologiczny

| Warstwa | Technologia |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Style | TailwindCSS 3 + tokeny CSS (tryb jasny/ciemny) |
| Baza | PostgreSQL |
| ORM | Prisma 6 |
| Autoryzacja | Auth.js v5 (NextAuth), Credentials + bcrypt, JWT, RBAC |
| Mapa | Google Maps (`@vis.gl/react-google-maps`, AdvancedMarker) |
| Wykresy | Recharts |
| Stan klienta | Zustand |
| Walidacja | Zod + React Hook Form |
| Hosting | Vercel |
| Storage | Supabase Storage / AWS S3 (moduł dokumentów) |

---

## Szybki start

### Tryb demo (bez bazy) — natychmiastowy podgląd

Aplikacja działa **bez bazy danych** — gdy `DATABASE_URL` nie jest ustawione, wchodzi
w tryb demo z realistycznymi danymi (lokalizacje w polskich miastach).

```bash
cd geocrm
npm install
npm run build && npm run start   # lub: npm run dev
```

Logowanie w trybie demo: **`admin@net4zero.pl`** / **`demo1234`**
(mapa wymaga `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; bez klucza działa lista + legenda).

### Tryb produkcyjny (z PostgreSQL)

```bash
cp .env.example .env          # uzupełnij DATABASE_URL, AUTH_SECRET, klucz Google Maps
npm install
npm run prisma:migrate        # utworzenie schematu
npm run db:seed               # dane startowe (org NET4ZERO + użytkownicy ról)
npm run dev
```

Wygeneruj `AUTH_SECRET`: `openssl rand -base64 32`.

---

## Zmienne środowiskowe

Zobacz [`.env.example`](./.env.example). Kluczowe:

- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL (pooler + direct do migracji)
- `AUTH_SECRET` — sekret Auth.js
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Maps JavaScript + Geocoding + Places API
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` — Map ID (wymagany dla AdvancedMarker)

---

## Skrypty

| Skrypt | Opis |
|---|---|
| `npm run dev` | serwer deweloperski |
| `npm run build` | `prisma generate` + build produkcyjny |
| `npm run start` | serwer produkcyjny |
| `npm run typecheck` | kontrola typów TS |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | migracje (dev) |
| `npm run db:seed` | dane startowe |
| `npm run prisma:studio` | Prisma Studio |

---

## Struktura projektu

```
geocrm/
├─ prisma/
│  ├─ schema.prisma        # pełny model domeny (multi-tenant)
│  └─ seed.ts              # dane startowe
├─ src/
│  ├─ app/
│  │  ├─ (auth)/           # login, register, forgot/reset-password
│  │  ├─ (app)/            # panel: dashboard, map, locations, regiony, …
│  │  ├─ api/              # auth, locations
│  │  └─ actions/          # server actions (auth, locations)
│  ├─ components/
│  │  ├─ ui/               # prymitywy (button, card, badge, input)
│  │  ├─ layout/           # sidebar, topbar, mobile-nav
│  │  ├─ dashboard/        # KPI, wykresy, aktywności
│  │  ├─ map/              # mapa, markery, legenda, „map experience”
│  │  └─ locations/        # lista CRM, karta, drawer
│  ├─ lib/                 # prisma, auth, rbac, queries, constants, demo-data
│  ├─ store/               # zustand (filtry, zaznaczenie)
│  └─ types/               # DTO + augmentacja Auth.js
└─ ARCHITECTURE.md         # architektura + diagram + schemat bazy
```

---

## Role (RBAC)

Administrator · Manager · Handlowiec · Inwestor · Serwisant — macierz uprawnień
w [`src/lib/rbac.ts`](./src/lib/rbac.ts).

## Statusy lokalizacji (kolory markerów)

🟢 Podpisana · 🟡 Negocjacje · 🔵 Instalacja · 🔴 Odrzucona · ⚪ Wolna
— jedyne źródło prawdy: [`src/lib/constants.ts`](./src/lib/constants.ts).

---

## Deployment (Vercel)

Root Directory: `geocrm`. Ustaw zmienne środowiskowe (jak wyżej). Build:
`npm run build`. Baza: Supabase / Neon (PostgreSQL). Marketingowa strona
NET4ZERO w katalogu głównym repo pozostaje niezależnym deploymentem.

---

Dokumentacja architektury: [ARCHITECTURE.md](./ARCHITECTURE.md) · Plan rozwoju: [ROADMAP.md](./ROADMAP.md)
