'use client';

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? 'DEMO_MAP_ID';

interface Position {
  lat: number;
  lng: number;
}

/**
 * Wybór lokalizacji na mapie (Etap 6):
 *  • wyszukiwanie adresu → Google Geocoding → ustawienie pinezki,
 *  • przeciąganie pinezki dla ręcznej korekty,
 *  • auto-uzupełnienie pól adres/miasto/województwo/kod.
 * Renderuje pola formularza (name=...) używane przy zapisie lokalizacji.
 */
export function LocationPicker({
  defaultAddress = '',
  defaultCity = '',
  defaultVoivodeship = '',
  defaultPostalCode = '',
}: {
  defaultAddress?: string;
  defaultCity?: string;
  defaultVoivodeship?: string;
  defaultPostalCode?: string;
}) {
  const [position, setPosition] = useState<Position>(DEFAULT_MAP_CENTER);
  const [address, setAddress] = useState(defaultAddress);
  const [city, setCity] = useState(defaultCity);
  const [voivodeship, setVoivodeship] = useState(defaultVoivodeship);
  const [postalCode, setPostalCode] = useState(defaultPostalCode);

  const fields = (
    <>
      <input type="hidden" name="latitude" value={position.lat} />
      <input type="hidden" name="longitude" value={position.lng} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium">Adres</label>
          <Input name="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ul. Przykładowa 1" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Miasto</label>
          <Input name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Wrocław" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Województwo</label>
          <Input name="voivodeship" value={voivodeship} onChange={(e) => setVoivodeship(e.target.value)} placeholder="Dolnośląskie" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Kod pocztowy</label>
          <Input name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="50-001" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Koordynaty</label>
          <Input value={`${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`} readOnly className="bg-secondary/50" />
        </div>
      </div>
    </>
  );

  // Brak klucza — ręczne wpisanie współrzędnych (bez mapy).
  if (!API_KEY) {
    return (
      <div className="space-y-4">
        {fields}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Szerokość (lat)</label>
            <Input
              type="number"
              step="any"
              value={position.lat}
              onChange={(e) => setPosition((p) => ({ ...p, lat: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Długość (lng)</label>
            <Input
              type="number"
              step="any"
              value={position.lng}
              onChange={(e) => setPosition((p) => ({ ...p, lng: Number(e.target.value) }))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Ustaw <code className="rounded bg-secondary px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>, aby wyszukiwać adres i przeciągać pinezkę na mapie.
        </p>
      </div>
    );
  }

  const onGeocoded = (pos: Position, comps: Partial<{ address: string; city: string; voivodeship: string; postalCode: string }>) => {
    setPosition(pos);
    if (comps.address) setAddress(comps.address);
    if (comps.city) setCity(comps.city);
    if (comps.voivodeship) setVoivodeship(comps.voivodeship);
    if (comps.postalCode) setPostalCode(comps.postalCode);
  };

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="space-y-4">
        {fields}
        <div className="h-72 overflow-hidden rounded-lg border">
          <Map
            mapId={MAP_ID}
            defaultCenter={DEFAULT_MAP_CENTER}
            defaultZoom={6}
            gestureHandling="greedy"
            className="h-full w-full"
          >
            <AdvancedMarker
              position={position}
              draggable
              onDragEnd={(e) => {
                if (e.latLng) setPosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              }}
            >
              <Pin background="#4CAF50" borderColor="#ffffff" glyphColor="#ffffff" />
            </AdvancedMarker>
            <Recenter position={position} />
          </Map>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Przeciągnij pinezkę, aby dopracować pozycję.
        </p>
        <GeocodeSearch address={address} onAddressChange={setAddress} onGeocoded={onGeocoded} />
      </div>
    </APIProvider>
  );
}

function Recenter({ position }: { position: Position }) {
  const map = useMap();
  useEffect(() => {
    if (map) map.panTo(position);
  }, [map, position]);
  return null;
}

function GeocodeSearch({
  address,
  onAddressChange,
  onGeocoded,
}: {
  address: string;
  onAddressChange: (v: string) => void;
  onGeocoded: (pos: Position, comps: Partial<{ address: string; city: string; voivodeship: string; postalCode: string }>) => void;
}) {
  const geocodingLib = useMapsLibrary('geocoding');
  const geocoder = useMemo(() => (geocodingLib ? new geocodingLib.Geocoder() : null), [geocodingLib]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    if (!geocoder || !address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { results } = await geocoder.geocode({ address, region: 'pl' });
      const r = results[0];
      if (!r) {
        setError('Nie znaleziono adresu.');
        return;
      }
      const get = (type: string) =>
        r.address_components.find((c) => c.types.includes(type))?.long_name ?? '';
      const streetNo = get('street_number');
      const route = get('route');
      onGeocoded(
        { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() },
        {
          address: [route, streetNo].filter(Boolean).join(' '),
          city: get('locality') || get('administrative_area_level_2'),
          voivodeship: get('administrative_area_level_1'),
          postalCode: get('postal_code'),
        },
      );
    } catch {
      setError('Błąd geokodowania.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Wyszukaj adres</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Wpisz adres i naciśnij Enter…"
            className="pl-9"
          />
        </div>
        <Button type="button" variant="outline" onClick={search} disabled={loading || !geocoder}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          Znajdź
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
