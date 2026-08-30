'use client';

import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';
import { MapPinned, Undo2, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import { geoJSONToPath, pathToGeoJSON } from '@/lib/geo';
import type { GeoJSONPolygon, RegionItem } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

type LatLng = { lat: number; lng: number };

interface RegionMapProps {
  regions: RegionItem[];
  drawing?: boolean;
  onDrawn?: (geometry: GeoJSONPolygon) => void;
  highlightId?: string | null;
}

export function RegionMap({ regions, drawing = false, onDrawn, highlightId }: RegionMapProps) {
  if (!API_KEY) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-secondary/40 p-8 text-center">
        <MapPinned className="h-10 w-10 text-muted-foreground" />
        <p className="max-w-xs text-sm text-muted-foreground">
          Rysowanie regionów wymaga klucza <code className="rounded bg-background px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
          Formularz i lista regionów działają bez mapy.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="relative h-full w-full">
        <Map
          mapId={MAP_ID}
          defaultCenter={DEFAULT_MAP_CENTER}
          defaultZoom={DEFAULT_MAP_ZOOM}
          gestureHandling="greedy"
          disableDoubleClickZoom
          className="h-full w-full"
        >
          <RegionPolygons regions={regions} highlightId={highlightId} />
          {drawing && <DrawTool onDrawn={onDrawn} />}
        </Map>
      </div>
    </APIProvider>
  );
}

/** Renderuje istniejące regiony jako wielokąty na mapie. */
function RegionPolygons({ regions, highlightId }: { regions: RegionItem[]; highlightId?: string | null }) {
  const map = useMap();
  const polysRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map) return;
    polysRef.current.forEach((p) => p.setMap(null));
    polysRef.current = [];

    for (const region of regions) {
      if (!region.geometry) continue;
      const color = region.color ?? '#4CAF50';
      const highlighted = highlightId === region.id;
      polysRef.current.push(
        new google.maps.Polygon({
          paths: geoJSONToPath(region.geometry),
          strokeColor: color,
          strokeOpacity: 0.9,
          strokeWeight: highlighted ? 3 : 2,
          fillColor: color,
          fillOpacity: highlighted ? 0.25 : 0.12,
          map,
        }),
      );
    }

    return () => {
      polysRef.current.forEach((p) => p.setMap(null));
      polysRef.current = [];
    };
  }, [map, regions, highlightId]);

  return null;
}

/**
 * Narzędzie rysowania (bez zdeprecjonowanego DrawingManagera):
 * klikaj punkty na mapie, aby dodać wierzchołki obszaru; przyciski
 * pozwalają cofnąć punkt, wyczyścić lub zatwierdzić region.
 */
function DrawTool({ onDrawn }: { onDrawn?: (geometry: GeoJSONPolygon) => void }) {
  const map = useMap();
  const [vertices, setVertices] = useState<LatLng[]>([]);
  const polyRef = useRef<google.maps.Polygon | null>(null);

  // Nasłuch kliknięć mapy → dodawanie wierzchołków.
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setVertices((prev) => [...prev, point]);
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [map]);

  // Rysowanie bieżącego wielokąta.
  useEffect(() => {
    if (!map) return;
    if (polyRef.current) polyRef.current.setMap(null);
    if (vertices.length === 0) return;
    polyRef.current = new google.maps.Polygon({
      paths: vertices,
      strokeColor: '#03A9F4',
      strokeWeight: 2,
      fillColor: '#03A9F4',
      fillOpacity: 0.15,
      map,
    });
    return () => {
      polyRef.current?.setMap(null);
    };
  }, [map, vertices]);

  const finish = () => {
    if (vertices.length < 3 || !onDrawn) return;
    onDrawn(pathToGeoJSON(vertices));
  };

  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border bg-background/95 px-2 py-1.5 shadow-md backdrop-blur">
      <span className="px-1 text-xs text-muted-foreground">
        {vertices.length < 3 ? `Kliknij punkty (${vertices.length}/3+)` : `${vertices.length} punktów`}
      </span>
      <Button type="button" variant="ghost" size="icon" onClick={() => setVertices((v) => v.slice(0, -1))} disabled={vertices.length === 0} aria-label="Cofnij punkt">
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => setVertices([])} disabled={vertices.length === 0} aria-label="Wyczyść">
        <Trash2 className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" onClick={finish} disabled={vertices.length < 3}>
        <Check className="h-4 w-4" /> Zatwierdź obszar
      </Button>
    </div>
  );
}
