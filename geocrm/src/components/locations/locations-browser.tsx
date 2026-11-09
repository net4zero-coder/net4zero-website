'use client';

import { useRouter } from 'next/navigation';
import { CrmList } from './crm-list';
import type { LocationListItem } from '@/types';

/** Pełnostronicowa przeglądarka lokalizacji — klik w wiersz otwiera kartę. */
export function LocationsBrowser({ locations }: { locations: LocationListItem[] }) {
  const router = useRouter();
  return (
    <div className="h-[calc(100vh-8.5rem)] overflow-hidden rounded-lg border bg-card lg:h-[calc(100vh-9rem)]">
      <CrmList locations={locations} onSelect={(id) => router.push(`/locations/${id}`)} />
    </div>
  );
}
