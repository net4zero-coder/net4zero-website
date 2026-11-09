'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Trash2, Pencil, Check, X, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RegionMap } from './region-map';
import { createRegion, updateRegion, deleteRegion } from '@/app/actions/regions';
import { cn } from '@/lib/utils';
import type { GeoJSONPolygon, Option, RegionItem, RegionType } from '@/types';

const REGION_TYPE_LABELS: Record<RegionType, string> = {
  WOJEWODZTWO: 'Województwo',
  POWIAT: 'Powiat',
  MIASTO: 'Miasto',
  CUSTOM: 'Własny obszar',
};

const COLORS = ['#4CAF50', '#03A9F4', '#8b5cf6', '#f59e0b', '#dc2626', '#0f172a'];

export function RegionsManager({
  regions,
  agents,
  investors,
}: {
  regions: RegionItem[];
  agents: Option[];
  investors: Option[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<RegionItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJSONPolygon | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [createState, createAction] = useActionState(createRegion, undefined);
  const [updateState, updateAction] = useActionState(updateRegion, undefined);
  const state = editing ? updateState : createState;
  const formActive = creating || !!editing;

  // Po sukcesie zapisu — odśwież i zamknij formularz.
  useEffect(() => {
    if (state?.success) {
      setCreating(false);
      setEditing(null);
      setDrawnGeometry(null);
      router.refresh();
    }
  }, [state?.success, router]);

  const startCreate = () => {
    setEditing(null);
    setDrawnGeometry(null);
    setCreating(true);
  };
  const startEdit = (region: RegionItem) => {
    setCreating(false);
    setDrawnGeometry(region.geometry);
    setEditing(region);
    setHighlightId(region.id);
  };
  const cancel = () => {
    setCreating(false);
    setEditing(null);
    setDrawnGeometry(null);
  };

  const handleDelete = (region: RegionItem) => {
    if (!confirm(`Usunąć region „${region.name}”?`)) return;
    startTransition(async () => {
      const res = await deleteRegion(region.id);
      if (res?.error) alert(res.error);
      router.refresh();
    });
  };

  return (
    <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
      {/* Panel: lista + formularz */}
      <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        {!formActive && (
          <Button onClick={startCreate}>
            <Plus className="h-4 w-4" /> Nowy region
          </Button>
        )}

        {formActive && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{editing ? 'Edytuj region' : 'Nowy region'}</h3>
              <Button variant="ghost" size="icon" onClick={cancel} aria-label="Anuluj">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form ref={formRef} action={editing ? updateAction : createAction} className="space-y-3">
              {editing && <input type="hidden" name="id" value={editing.id} />}
              <input type="hidden" name="geometry" value={drawnGeometry ? JSON.stringify(drawnGeometry) : ''} />

              <div>
                <label className="mb-1 block text-sm font-medium">Nazwa</label>
                <Input name="name" defaultValue={editing?.name ?? ''} required placeholder="np. Wrocław — Południe" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Typ</label>
                <Select name="type" defaultValue={editing?.type ?? 'CUSTOM'}>
                  {(Object.keys(REGION_TYPE_LABELS) as RegionType[]).map((t) => (
                    <option key={t} value={t}>
                      {REGION_TYPE_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Kolor</label>
                <div className="flex gap-2">
                  {COLORS.map((c, i) => (
                    <label key={c} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={c}
                        defaultChecked={editing ? editing.color === c : i === 0}
                        className="peer sr-only"
                      />
                      <span
                        className="block h-7 w-7 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-foreground"
                        style={{ backgroundColor: c }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Handlowiec</label>
                <Select name="agentId" defaultValue={editing?.agentId ?? ''}>
                  <option value="">— brak —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Inwestor</label>
                <Select name="investorId" defaultValue={editing?.investorId ?? ''}>
                  <option value="">— brak —</option>
                  {investors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="rounded-md bg-secondary/60 p-2.5 text-xs text-muted-foreground">
                {drawnGeometry ? (
                  <span className="flex items-center gap-1.5 text-primary">
                    <Check className="h-3.5 w-3.5" /> Obszar narysowany ({drawnGeometry.coordinates[0].length - 1} punktów)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Narysuj obszar na mapie (dla typu „Własny obszar”)
                  </span>
                )}
              </div>

              {state?.error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
              )}

              <Button type="submit" className="w-full">
                {editing ? 'Zapisz zmiany' : 'Utwórz region'}
              </Button>
            </form>
          </Card>
        )}

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> Regiony ({regions.length})
          </p>
          {regions.map((r) => (
            <Card
              key={r.id}
              className={cn(
                'p-3 transition-colors',
                highlightId === r.id ? 'ring-2 ring-primary' : '',
              )}
              onMouseEnter={() => setHighlightId(r.id)}
              onMouseLeave={() => setHighlightId(null)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: r.color ?? '#94a3b8' }} />
                    <span className="truncate font-medium">{r.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {REGION_TYPE_LABELS[r.type]} · {r.locationCount} lok.
                    {r.agentName ? ` · 👤 ${r.agentName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(r)} aria-label="Edytuj">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(r)}
                    disabled={isPending}
                    aria-label="Usuń"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {regions.length === 0 && (
            <p className="px-1 text-sm text-muted-foreground">Brak regionów — utwórz pierwszy.</p>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div className="overflow-hidden rounded-lg border">
        <RegionMap
          regions={regions}
          drawing={formActive}
          onDrawn={setDrawnGeometry}
          highlightId={highlightId}
        />
      </div>
    </div>
  );
}
