'use client';

import { MapView } from './map-view';
import { MapLegend } from './map-legend';
import { CrmList } from '@/components/locations/crm-list';
import { LocationDetailDrawer } from '@/components/locations/location-detail-drawer';
import { useCrmStore, applyFilters } from '@/store/crm-store';
import { useMemo } from 'react';
import type { LocationListItem, RegionItem } from '@/types';

/**
 * Serce systemu — mapa Google z panelem listy CRM (po lewej) i wysuwaną kartą
 * lokalizacji (po prawej). Lista i mapa współdzielą stan filtrów oraz zaznaczenie.
 */
export function MapExperience({
  locations,
  regions = [],
}: {
  locations: LocationListItem[];
  regions?: RegionItem[];
}) {
  const { filters, sort, selectedId, select } = useCrmStore();

  // Mapa pokazuje te same lokalizacje co przefiltrowana lista.
  const visible = useMemo(() => applyFilters(locations, filters, sort), [locations, filters, sort]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Panel listy CRM */}
      <div className="hidden w-[360px] shrink-0 border-r md:flex md:flex-col">
        <CrmList locations={locations} onSelect={select} />
      </div>

      {/* Mapa + drawer */}
      <div className="relative flex-1">
        <MapView locations={visible} selectedId={selectedId} onSelect={select} regions={regions} />
        <MapLegend />
        <LocationDetailDrawer locationId={selectedId} onClose={() => select(null)} />
      </div>
    </div>
  );
}
