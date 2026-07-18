'use client';

import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { useEffect } from 'react';
import { MapPinned } from 'lucide-react';
import { STATUS_META, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import type { LocationListItem } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

interface MapViewProps {
  locations: LocationListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function MapView({ locations, selectedId, onSelect }: MapViewProps) {
  if (!API_KEY) return <MapFallback locations={locations} />;

  return (
    <APIProvider apiKey={API_KEY}>
      <Map
        mapId={MAP_ID}
        defaultCenter={DEFAULT_MAP_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full w-full"
      >
        {locations.map((loc) => {
          const meta = STATUS_META[loc.status];
          const active = loc.id === selectedId;
          return (
            <AdvancedMarker
              key={loc.id}
              position={{ lat: loc.latitude, lng: loc.longitude }}
              onClick={() => onSelect(loc.id)}
              zIndex={active ? 999 : undefined}
            >
              <Pin
                background={meta.color}
                borderColor="#ffffff"
                glyphColor="#ffffff"
                scale={active ? 1.4 : 1}
              />
            </AdvancedMarker>
          );
        })}
        <FitBounds locations={locations} selectedId={selectedId} />
      </Map>
    </APIProvider>
  );
}

/** Dopasowuje widok do markerów / centruje na wybranej lokalizacji. */
function FitBounds({
  locations,
  selectedId,
}: {
  locations: LocationListItem[];
  selectedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || locations.length === 0) return;
    if (selectedId) {
      const sel = locations.find((l) => l.id === selectedId);
      if (sel) {
        map.panTo({ lat: sel.latitude, lng: sel.longitude });
        map.setZoom(14);
      }
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    locations.forEach((l) => bounds.extend({ lat: l.latitude, lng: l.longitude }));
    map.fitBounds(bounds, 64);
  }, [map, locations, selectedId]);

  return null;
}

/** Widok zastępczy gdy brak klucza Google Maps — legenda + info. */
function MapFallback({ locations }: { locations: LocationListItem[] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-secondary/40 p-8 text-center">
      <MapPinned className="h-12 w-12 text-muted-foreground" />
      <div>
        <p className="font-medium">Podgląd mapy niedostępny</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ustaw <code className="rounded bg-background px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>,
          aby wyświetlić {locations.length} lokalizacji na mapie Google. Lista po lewej działa
          niezależnie od mapy.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {Object.values(STATUS_META).map((m) => (
          <span key={m.label} className="flex items-center gap-1.5 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
