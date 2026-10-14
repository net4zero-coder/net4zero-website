'use client';

import { create } from 'zustand';
import type { LocationListItem, LocationStatus } from '@/types';

export type SortKey = 'updatedAt' | 'name' | 'city' | 'status';

interface CrmFilters {
  search: string;
  status: LocationStatus | 'ALL';
  voivodeship: string | 'ALL';
  agent: string | 'ALL';
  investor: string | 'ALL';
  operator: string | 'ALL';
}

interface CrmState {
  filters: CrmFilters;
  sort: SortKey;
  selectedId: string | null;
  setFilter: <K extends keyof CrmFilters>(key: K, value: CrmFilters[K]) => void;
  resetFilters: () => void;
  setSort: (sort: SortKey) => void;
  select: (id: string | null) => void;
}

const DEFAULT_FILTERS: CrmFilters = {
  search: '',
  status: 'ALL',
  voivodeship: 'ALL',
  agent: 'ALL',
  investor: 'ALL',
  operator: 'ALL',
};

export const useCrmStore = create<CrmState>((set) => ({
  filters: DEFAULT_FILTERS,
  sort: 'updatedAt',
  selectedId: null,
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setSort: (sort) => set({ sort }),
  select: (id) => set({ selectedId: id }),
}));

/** Zastosowanie filtrów + sortowania po stronie klienta. */
export function applyFilters(
  items: LocationListItem[],
  filters: CrmFilters,
  sort: SortKey,
): LocationListItem[] {
  const filtered = items.filter((l) => {
    if (filters.status !== 'ALL' && l.status !== filters.status) return false;
    if (filters.voivodeship !== 'ALL' && l.voivodeship !== filters.voivodeship) return false;
    if (filters.agent !== 'ALL' && l.agentName !== filters.agent) return false;
    if (filters.investor !== 'ALL' && l.investorName !== filters.investor) return false;
    if (filters.operator !== 'ALL' && l.operatorName !== filters.operator) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const hay = `${l.name} ${l.address ?? ''} ${l.city ?? ''} ${l.deviceNumber ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.name.localeCompare(b.name, 'pl');
      case 'city':
        return (a.city ?? '').localeCompare(b.city ?? '', 'pl');
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
}

/** Wyciąga unikalne wartości do dropdownów filtrów. */
export function facet(items: LocationListItem[], key: keyof LocationListItem): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const v = item[key];
    if (typeof v === 'string' && v) set.add(v);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pl'));
}
