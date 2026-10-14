'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Trash2, Cpu, Search, MapPin, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';
import { DEVICE_STATUS_META, DEVICE_STATUSES } from '@/lib/constants';
import { createDevice, updateDeviceStatus, deleteDevice, type DeviceFormState } from '@/app/actions/devices';
import type { DeviceItem, DeviceStatus, Option } from '@/types';

export function DevicesManager({
  devices,
  locations,
}: {
  devices: DeviceItem[];
  locations: Option[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DeviceStatus | 'ALL'>('ALL');
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState<DeviceFormState, FormData>(createDevice, undefined);

  useEffect(() => {
    if (state?.success) {
      setCreating(false);
      router.refresh();
    }
  }, [state?.success, router]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(DEVICE_STATUSES.map((s) => [s, 0])) as Record<DeviceStatus, number>;
    for (const d of devices) map[d.status]++;
    return map;
  }, [devices]);

  const filtered = useMemo(
    () =>
      devices.filter((d) => {
        if (status !== 'ALL' && d.status !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!`${d.serialNumber} ${d.model ?? ''} ${d.locationName ?? ''}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [devices, search, status],
  );

  const move = (id: string, s: DeviceStatus) =>
    startTransition(async () => {
      const res = await updateDeviceStatus(id, s);
      if (res?.error) alert(res.error);
      router.refresh();
    });

  const remove = (d: DeviceItem) => {
    if (!confirm(`Usunąć urządzenie „${d.serialNumber}”?`)) return;
    startTransition(async () => {
      const res = await deleteDevice(d.id);
      if (res?.error) alert(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* KPI wg statusu */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {DEVICE_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus((cur) => (cur === s ? 'ALL' : s))}
            className={cn(
              'rounded-lg border p-3 text-left transition-colors',
              status === s ? 'border-primary bg-primary/5' : 'hover:bg-secondary/60',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DEVICE_STATUS_META[s].color }} />
              <span className="text-xs text-muted-foreground">{DEVICE_STATUS_META[s].label}</span>
            </div>
            <p className="mt-1 text-2xl font-semibold">{counts[s]}</p>
          </button>
        ))}
      </div>

      {/* Pasek narzędzi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj: nr seryjny, model, lokalizacja…" className="w-72 pl-9" />
          </div>
          {status !== 'ALL' && (
            <Button variant="ghost" size="sm" onClick={() => setStatus('ALL')}>
              <X className="h-4 w-4" /> {DEVICE_STATUS_META[status].label}
            </Button>
          )}
        </div>
        <Button onClick={() => setCreating((c) => !c)}>
          {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {creating ? 'Anuluj' : 'Dodaj urządzenie'}
        </Button>
      </div>

      {creating && (
        <Card className="p-4">
          <form action={action} className="grid gap-3 sm:grid-cols-2">
            <Input name="serialNumber" placeholder="Numer seryjny * (np. RVM-DS-030)" required />
            <Input name="model" placeholder="Model (np. TOMRA T9)" />
            <Select name="status" defaultValue="PLANNED">
              {DEVICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {DEVICE_STATUS_META[s].label}
                </option>
              ))}
            </Select>
            <Select name="locationId" defaultValue="">
              <option value="">Lokalizacja: — brak —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            {state?.error && (
              <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit">Zapisz urządzenie</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista urządzeń */}
      <Card className="divide-y">
        {filtered.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {d.serialNumber}
                  {d.model ? <span className="font-normal text-muted-foreground"> · {d.model}</span> : ''}
                </p>
                <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  {d.locationName && (
                    <Link href={`/locations/${d.locationId}`} className="flex items-center gap-1 text-primary hover:underline">
                      <MapPin className="h-3 w-3" /> {d.locationName}
                    </Link>
                  )}
                  {d.operatorName && <span>{d.operatorName}</span>}
                  {d.lastServiceAt && (
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> serwis: {formatDate(d.lastServiceAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={d.status}
                onChange={(e) => move(d.id, e.target.value as DeviceStatus)}
                className="h-8 w-auto text-xs"
                disabled={isPending}
              >
                {DEVICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DEVICE_STATUS_META[s].label}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" size="icon" onClick={() => remove(d)} disabled={isPending} aria-label="Usuń">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Brak urządzeń.</p>}
      </Card>
    </div>
  );
}
