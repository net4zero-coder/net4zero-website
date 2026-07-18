'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LocationDetailView } from './location-detail-view';
import type { LocationDetail } from '@/types';

/** Wysuwany panel z kartą lokalizacji (mapa / lista). Pobiera dane po id. */
export function LocationDetailDrawer({
  locationId,
  onClose,
}: {
  locationId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<LocationDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/locations/${locationId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [locationId]);

  if (!locationId) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={onClose} />
      <div className="absolute right-0 top-0 z-50 flex h-full w-full max-w-md animate-slide-in flex-col border-l bg-card shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-1">
            {detail && (
              <Link
                href={`/locations/${detail.id}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                <ExternalLink className="h-4 w-4" /> Pełna karta
              </Link>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Zamknij">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && detail && <LocationDetailView location={detail} />}
          {!loading && !detail && (
            <p className="p-6 text-center text-sm text-muted-foreground">Nie znaleziono lokalizacji.</p>
          )}
        </div>
      </div>
    </>
  );
}
