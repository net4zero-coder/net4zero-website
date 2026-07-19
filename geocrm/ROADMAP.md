# Plan rozwoju GeoCRM

Legenda: ✅ gotowe · 🟡 częściowo (scaffold + model danych) · ⬜ zaplanowane

## Zrealizowane w fundamencie

| Etap | Zakres | Status |
|---|---|---|
| 1 | Architektura, stack, struktura folderów, **pełny schemat bazy** | ✅ |
| 2 | Logowanie / rejestracja / reset hasła + **RBAC (5 ról)** | ✅ |
| 3 | Dashboard: KPI, wykresy (Recharts), ostatnie aktywności | ✅ |
| 4 | **Mapa Google** z markerami kolorowanymi wg statusu | ✅ |
| 5 | **Regiony** — rysowanie obszaru na mapie, typy (woj./powiat/miasto/custom), edycja/usuwanie, przypisanie handlowca+inwestora, auto-przypisanie lokalizacji (point-in-polygon), nakładki na mapie | ✅ |
| 6 | Dodawanie lokalizacji — formularz + **auto-geocoding adresu i przeciąganie pinezki** | ✅ |
| 7 | Lista CRM — szukanie, sortowanie, filtrowanie (region/status/handlowiec/…) | ✅ |
| 8 | Karta lokalizacji — zakładki: przegląd/historia/notatki/zdjęcia/dokumenty/zadania/kontakty | ✅ |
| 9 | **Handlowcy** — portfele, statystyki (lokalizacje/podpisane/regiony/zadania/prognoza) + ranking | ✅ |
| 10 | **Inwestorzy** — portfele: lokalizacje, urządzenia, ROI, prognoza, kontakt | ✅ |
| 10/kaucyjny | **Umowy** — rejestr kontraktów (statusy, wartości, wygaśnięcie, powiązania z lokalizacją/inwestorem), zasilają KPI dashboardu | ✅ |
| 11 | **Dokumenty** — lista/filtry, dodawanie (metadane + link), abstrakcja storage (Supabase/S3) | ✅ (bez fizycznego uploadu) |
| 12 | **Zadania** — tablica kanban + lista, priorytety, terminy, osoba, lokalizacja, zmiana statusu | ✅ (bez powiadomień e-mail) |
| 13 | **Raporty** — statusy/województwa/handlowcy/inwestorzy/regiony + **eksport CSV** | ✅ (PDF/XLSX w planie) |
| 14 | Responsywność (desktop/tablet/telefon, mobilna nawigacja) | ✅ |
| 15 | Wygląd: minimalistyczny, tryb jasny/ciemny, animacje, zaokrąglenia | ✅ |
| 2/16 | **Ustawienia** — zarządzanie użytkownikami (dodawanie, zmiana roli, aktywacja/dezaktywacja) | ✅ |
| kaucyjny | **Urządzenia** — rejestr recyklomatów (statusy, serwis, KPI, powiązania) | ✅ |

## Do zrealizowania

| Etap | Moduł | Kluczowe zadania |
|---|---|---|
| 5+ | **Regiony** (rozszerzenie) | import granic TERYT (woj./powiat/miasto) z oficjalnych GeoJSON, edycja wierzchołków istniejącego obszaru |
| 6+ | **Lokalizacje** | ~~edycja + historia zmian pól~~ ✅ · ~~notatki i kontakty inline~~ ✅ · pozostaje: upload zdjęć |
| 9+ | **Handlowcy** (rozszerzenie) | kalendarz spotkań (CalendarEvent), cele sprzedażowe (SalesGoal) i ich realizacja |
| 10+ | **Inwestorzy** (rozszerzenie) | umowy, przychody, konto podglądowe (rola INVESTOR) |
| 11+ | **Dokumenty** (rozszerzenie) | fizyczny upload plików do Supabase Storage / S3 (multipart) |
| 12+ | **Zadania** (rozszerzenie) | powiadomienia e-mail o terminach, drag&drop na tablicy |
| 13+ | **Raporty** (rozszerzenie) | eksport do PDF i XLSX, filtry po okresie |
| 16 | **Jakość** | testy (Vitest/Playwright), CI, audyt wydajności, pełna dokumentacja |

## Moduły specyficzne dla systemu kaucyjnego (rozszerzenie)

Rekomendowane, by aplikacja była projektowana pod NET4ZERO, a nie jako ogólny CRM:

- **Urządzenia/monitoring** — ✅ rejestr recyklomatów (statusy, serwis, powiązania z lokalizacją/operatorem/inwestorem, KPI). Do dodania: telemetria i alerty serwisowe.
- **Integracje z operatorami** — wymiana danych o odbiorach i rozliczeniach.
- **Harmonogramy odbiorów** — planowanie i realizacja logistyki.
- **Rozliczenia** — handling fee / clearing fee per lokalizacja i inwestor.
- **Prognozowanie liczby opakowań** — model na bazie danych demograficznych lokalizacji.

## Rekomendowana kolejność

1. ~~Etap 5 (Regiony) + auto-geocoding~~ ✅
2. ~~Etap 12 (Zadania) + Etap 11 (Dokumenty)~~ ✅
3. ~~Etap 9/10 (Handlowcy/Inwestorzy)~~ ✅
4. ~~Etap 13 (Raporty z eksportem CSV)~~ ✅
5. **Konfiguracja produkcyjna** — PostgreSQL (Supabase/Neon) + domena + zmienne na Vercel.
6. Moduły kaucyjne (urządzenia/monitoring, rozliczenia, prognozy opakowań).
7. Rozszerzenia modułów (upload plików, powiadomienia, PDF/XLSX, kalendarz, cele).
8. Etap 16 (testy, CI, audyt) — równolegle od początku każdego modułu.
