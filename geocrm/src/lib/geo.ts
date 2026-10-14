import type { GeoJSONPolygon, RegionItem } from '@/types';

/**
 * Ray-casting: czy punkt (lat/lng) leży w wielokącie GeoJSON.
 * Współrzędne GeoJSON to [lng, lat].
 */
export function pointInPolygon(lat: number, lng: number, polygon: GeoJSONPolygon): boolean {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length < 3) return false;

  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; // [lng, lat]
    const [xj, yj] = ring[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Zwraca id pierwszego regionu (typu CUSTOM z geometrią) zawierającego punkt. */
export function findRegionForPoint(
  lat: number,
  lng: number,
  regions: Pick<RegionItem, 'id' | 'geometry'>[],
): string | null {
  for (const r of regions) {
    if (r.geometry && pointInPolygon(lat, lng, r.geometry)) return r.id;
  }
  return null;
}

/** Środek ciężkości wielokąta (do etykiet / centrowania). */
export function polygonCentroid(polygon: GeoJSONPolygon): { lat: number; lng: number } | null {
  const ring = polygon.coordinates[0];
  if (!ring || ring.length === 0) return null;
  let lat = 0;
  let lng = 0;
  for (const [x, y] of ring) {
    lng += x;
    lat += y;
  }
  return { lat: lat / ring.length, lng: lng / ring.length };
}

/** Konwersja ścieżki Google Maps (LatLngLiteral[]) → GeoJSON Polygon. */
export function pathToGeoJSON(path: { lat: number; lng: number }[]): GeoJSONPolygon {
  const coords = path.map((p) => [p.lng, p.lat] as [number, number]);
  // GeoJSON wymaga zamkniętego pierścienia
  if (coords.length > 0) {
    const [fx, fy] = coords[0];
    const [lx, ly] = coords[coords.length - 1];
    if (fx !== lx || fy !== ly) coords.push([fx, fy]);
  }
  return { type: 'Polygon', coordinates: [coords] };
}

/** Konwersja GeoJSON Polygon → ścieżka Google Maps (LatLngLiteral[]). */
export function geoJSONToPath(polygon: GeoJSONPolygon): { lat: number; lng: number }[] {
  return polygon.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
}
