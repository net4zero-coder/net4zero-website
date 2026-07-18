import { STATUS_META } from '@/lib/constants';

export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg border bg-background/90 p-3 shadow-md backdrop-blur">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legenda</p>
      <div className="space-y-1.5">
        {Object.values(STATUS_META).map((m) => (
          <div key={m.label} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
            {m.label}
          </div>
        ))}
      </div>
    </div>
  );
}
