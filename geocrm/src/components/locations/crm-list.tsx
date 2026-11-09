'use client';

import { useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input, Select } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LOCATION_STATUSES } from '@/lib/constants';
import { STATUS_META } from '@/lib/constants';
import { useCrmStore, applyFilters, facet } from '@/store/crm-store';
import type { LocationListItem } from '@/types';

export function CrmList({
  locations,
  onSelect,
}: {
  locations: LocationListItem[];
  onSelect?: (id: string) => void;
}) {
  const { filters, sort, selectedId, setFilter, setSort, resetFilters, select } = useCrmStore();

  const voivodeships = useMemo(() => facet(locations, 'voivodeship'), [locations]);
  const agents = useMemo(() => facet(locations, 'agentName'), [locations]);
  const investors = useMemo(() => facet(locations, 'investorName'), [locations]);

  const results = useMemo(
    () => applyFilters(locations, filters, sort),
    [locations, filters, sort],
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && v !== 'ALL',
  ).length;

  const handleSelect = (id: string) => {
    select(id);
    onSelect?.(id);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Szukaj + filtry */}
      <div className="space-y-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Szukaj: nazwa, adres, miasto, nr urządzenia…"
            className="pl-9"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={filters.status} onChange={(e) => setFilter('status', e.target.value as never)}>
            <option value="ALL">Wszystkie statusy</option>
            {LOCATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <Select value={filters.voivodeship} onChange={(e) => setFilter('voivodeship', e.target.value as never)}>
            <option value="ALL">Województwo</option>
            {voivodeships.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
          <Select value={filters.agent} onChange={(e) => setFilter('agent', e.target.value as never)}>
            <option value="ALL">Handlowiec</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Select value={filters.investor} onChange={(e) => setFilter('investor', e.target.value as never)}>
            <option value="ALL">Inwestor</option>
            {investors.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{results.length} lokalizacji</span>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1 text-primary hover:underline">
                <X className="h-3 w-3" /> wyczyść ({activeFilterCount})
              </button>
            )}
          </div>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as never)}
            className="h-8 w-auto text-xs"
          >
            <option value="updatedAt">Ostatnio zmienione</option>
            <option value="name">Nazwa A-Z</option>
            <option value="city">Miasto</option>
            <option value="status">Status</option>
          </Select>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {results.map((loc) => (
          <button
            key={loc.id}
            onClick={() => handleSelect(loc.id)}
            className={cn(
              'flex w-full flex-col gap-1 border-b border-l-2 px-4 py-3 text-left transition-colors hover:bg-secondary/60',
              selectedId === loc.id ? 'border-l-primary bg-secondary/60' : 'border-l-transparent',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium leading-snug">{loc.name}</span>
              <StatusBadge status={loc.status} />
            </div>
            <span className="text-xs text-muted-foreground">
              {[loc.address, loc.city].filter(Boolean).join(', ') || '—'}
            </span>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              {loc.agentName && <span>👤 {loc.agentName}</span>}
              {loc.investorName && <span>🏢 {loc.investorName}</span>}
              {loc.deviceNumber && <span>🔢 {loc.deviceNumber}</span>}
            </div>
          </button>
        ))}
        {results.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            Brak lokalizacji spełniających kryteria.
          </p>
        )}
      </div>
    </div>
  );
}
