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
| 14 | Responsywność (desktop/tablet/telefon, mobilna nawigacja) | ✅ |
| 15 | Wygląd: minimalistyczny, tryb jasny/ciemny, animacje, zaokrąglenia | ✅ |

## Do zrealizowania

| Etap | Moduł | Kluczowe zadania |
|---|---|---|
| 5+ | **Regiony** (rozszerzenie) | import granic TERYT (woj./powiat/miasto) z oficjalnych GeoJSON, edycja wierzchołków istniejącego obszaru |
| 6+ | **Lokalizacje** | zapis historii każdej zmiany pola, upload zdjęć, edycja istniejącej lokalizacji |
| 9 | **Handlowcy** | region, lokalizacje, zadania, kalendarz, cele sprzedażowe, statystyki, ranking |
| 10 | **Inwestorzy** | portfel lokalizacji, urządzenia, ROI, przychody, status inwestycji, umowy, dokumenty, konto podglądowe |
| 11 | **Dokumenty** | upload (PDF/Word/Excel/zdjęcia), Supabase Storage / S3, powiązanie z lokalizacją/inwestorem |
| 12 | **Zadania** | osoba, termin, status, priorytet, **powiadomienia e-mail**, widok kanban |
| 13 | **Raporty** | regiony/sprzedaż/handlowcy/lokalizacje/inwestorzy/operatorzy/instalacje, **eksport Excel + PDF** |
| 16 | **Jakość** | testy (Vitest/Playwright), CI, audyt wydajności, pełna dokumentacja |

## Moduły specyficzne dla systemu kaucyjnego (rozszerzenie)

Rekomendowane, by aplikacja była projektowana pod NET4ZERO, a nie jako ogólny CRM:

- **Urządzenia/monitoring** — rejestr recyklomatów, statusy, telemetria, alerty serwisowe.
- **Integracje z operatorami** — wymiana danych o odbiorach i rozliczeniach.
- **Harmonogramy odbiorów** — planowanie i realizacja logistyki.
- **Rozliczenia** — handling fee / clearing fee per lokalizacja i inwestor.
- **Prognozowanie liczby opakowań** — model na bazie danych demograficznych lokalizacji.

## Rekomendowana kolejność

1. Etap 5 (Regiony) + auto-geocoding — domykają rdzeń mapowy.
2. Etap 12 (Zadania) + Etap 11 (Dokumenty) — praca operacyjna handlowców.
3. Etap 9/10 (Handlowcy/Inwestorzy) — pełne widoki portfelowe.
4. Etap 13 (Raporty z eksportem).
5. Moduły kaucyjne (urządzenia, rozliczenia, prognozy).
6. Etap 16 (testy, CI, audyt) — równolegle od początku każdego modułu.
