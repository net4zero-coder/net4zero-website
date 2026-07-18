# Architektura GeoCRM

## 1. Przegląd

GeoCRM to aplikacja SaaS (multi-tenant) zbudowana na Next.js App Router. Renderowanie
odbywa się po stronie serwera (React Server Components), z warstwą klienta dla mapy,
list filtrowanych i formularzy. Dostęp do danych jest odizolowany w warstwie
`src/lib/queries.ts`, co ułatwia testowanie i wymianę źródła danych.

```
┌──────────────────────────────────────────────────────────────┐
│                        Przeglądarka                          │
│  React 19 · Tailwind · Zustand (filtry) · Google Maps JS     │
└───────────────▲───────────────────────────┬──────────────────┘
                │ RSC / Server Actions       │ fetch /api/*
┌───────────────┴───────────────────────────▼──────────────────┐
│                    Next.js 15 (Vercel)                        │
│  ┌────────────┐  ┌───────────────┐  ┌────────────────────┐   │
│  │ Middleware │  │ Server Comp.  │  │ Route Handlers/API │   │
│  │ (Auth.js   │  │  + Actions    │  │  (locations, auth) │   │
│  │  edge)     │  └──────┬────────┘  └─────────┬──────────┘   │
│  └────────────┘         │                     │              │
│                   ┌─────▼─────────────────────▼─────┐        │
│                   │  Warstwa danych (queries.ts)    │        │
│                   │  demo-data  ⇄  Prisma Client    │        │
│                   └───────────────┬─────────────────┘        │
└───────────────────────────────────┼──────────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │   PostgreSQL        │
                          │  (Supabase / Neon)  │
                          └─────────────────────┘

  Storage (Supabase/S3) ── moduł dokumentów (Etap 11)
  Google Maps / Geocoding API ── mapa i lokalizacje
```

## 2. Warstwy

- **Prezentacja** — `src/app`, `src/components`. RSC domyślnie; komponenty klienckie
  (`'use client'`) tylko tam, gdzie potrzebna interaktywność (mapa, filtry, formularze).
- **Aplikacja** — Server Actions (`src/app/actions`) do mutacji (auth, lokalizacje);
  Route Handlers (`src/app/api`) dla pobrań asynchronicznych z klienta (karta w drawerze).
- **Domena/Dane** — `src/lib/queries.ts` (odczyty), `src/lib/rbac.ts` (uprawnienia),
  Prisma jako ORM. Fail-safe: przy braku/awarii bazy degradacja do danych demo.
- **Infrastruktura** — Prisma singleton, Auth.js (edge middleware + node runtime).

## 3. Autoryzacja i wielotenantowość

- Auth.js v5, provider **Credentials** (bcrypt), sesje **JWT**. Rola i `organizationId`
  trafiają do tokenu (`jwt` callback) i sesji (`session` callback).
- **Middleware** (`src/middleware.ts`) używa edge-safe configu (`auth.config.ts`) bez
  Prismy/bcrypt — chroni wszystkie trasy poza publicznymi.
- **RBAC** — macierz `zasób:akcja` w `rbac.ts`; `can()` filtruje nawigację i chroni akcje.
- **Tenant** — każda encja domenowa ma `organizationId`; zapytania są scope'owane do
  organizacji zalogowanego użytkownika.

## 4. Model danych (Prisma)

Główne encje i relacje:

```
Organization 1─* User (Role)          Organization 1─* Region
Organization 1─* Location             Region *─1 User (handlowiec), *─1 Investor
Location *─1 Region / User(agent) / Investor / Operator
Location 1─* Contact | Note | Photo | Document | Task | Device | Contract | LocationHistory
Investor 1─? User (konto INVESTOR)    Device *─1 Location/Operator/Investor
Contract *─1 Location/Investor        Task *─1 User(assignee)/Location
User 1─* SalesGoal | CalendarEvent    Organization 1─* Activity (feed)
Auth.js: User 1─* Account | Session ; VerificationToken ; PasswordResetToken
```

Enumy: `Role`, `LocationStatus`, `LocationType`, `RegionType`, `TaskStatus`,
`TaskPriority`, `DocumentCategory`, `DeviceStatus`, `ContractStatus`.

Pełna definicja: [`prisma/schema.prisma`](./prisma/schema.prisma).

### Kluczowe decyzje projektowe

- **Geometria regionów jako GeoJSON (`Json`)** — gotowe pod rysowanie obszarów na mapie
  (Etap 5) bez zależności od PostGIS na starcie; migracja do PostGIS możliwa później.
- **Historia zmian** — `LocationHistory` (zmiany pól) + `Activity` (feed dashboardu).
- **Indeksy** — na `organizationId`, `status`, kluczach obcych i `(latitude, longitude)`
  pod zapytania mapowe.
- **Separacja bytów** — Handlowiec = `User(role=SALES)`; Inwestor/Operator = osobne encje
  (mogą mieć opcjonalne konto logowania).

## 5. Mapa (serce systemu)

- `@vis.gl/react-google-maps` — `APIProvider` + `Map` + `AdvancedMarker`/`Pin`.
- Kolor markera = status (jedno źródło: `STATUS_META`). Zaznaczony marker jest skalowany.
- `MapExperience` synchronizuje mapę z listą CRM przez wspólny store (Zustand): filtry
  zawężają jednocześnie listę i markery; klik otwiera kartę w drawerze.
- Brak klucza API → zgrabny fallback z legendą (lista działa niezależnie).

## 6. Wydajność

- RSC + `force-dynamic` na trasach zależnych od użytkownika; brak zapytań do bazy w buildzie.
- Prisma singleton (bez wyczerpania połączeń w serverless).
- Indeksy pod filtry i zapytania mapowe; `take: 1000` jako bezpieczny limit listy.
- Kod klienta rozbity na komponenty klienckie tylko tam, gdzie konieczne.

## 7. Bezpieczeństwo

- Hasła: bcrypt. Tokeny resetu z czasem życia i flagą `used`.
- Reset hasła bez enumeracji użytkowników (zawsze generyczna odpowiedź).
- Ochrona tras w middleware; autoryzacja akcji przez `can()` po stronie serwera.
- Nagłówki bezpieczeństwa i CSP do skonfigurowania na poziomie Vercel (jak w stronie
  marketingowej).

## 8. Środowiska

- **Demo** (`DATABASE_URL` puste) — dane przykładowe, logowanie kontem demo.
- **Produkcja** — PostgreSQL + migracje Prisma + seed; Vercel z Root Directory `geocrm`.
