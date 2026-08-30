'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Trash2, FileSignature, MapPin, CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CONTRACT_STATUS_META, CONTRACT_STATUSES } from '@/lib/constants';
import { createContract, updateContractStatus, deleteContract, type ContractFormState } from '@/app/actions/contracts';
import type { ContractItem, ContractStatus, Option } from '@/types';

export function ContractsManager({
  contracts,
  locations,
  investors,
  canManage,
}: {
  contracts: ContractItem[];
  locations: Option[];
  investors: Option[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<ContractStatus | 'ALL'>('ALL');
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState<ContractFormState, FormData>(createContract, undefined);

  useEffect(() => {
    if (state?.success) {
      setCreating(false);
      router.refresh();
    }
  }, [state?.success, router]);

  const filtered = useMemo(
    () => contracts.filter((c) => status === 'ALL' || c.status === status),
    [contracts, status],
  );

  const totalValue = useMemo(
    () => filtered.reduce((s, c) => s + (c.value ?? 0), 0),
    [filtered],
  );

  const move = (id: string, s: ContractStatus) =>
    startTransition(async () => {
      const res = await updateContractStatus(id, s);
      if (res?.error) alert(res.error);
      router.refresh();
    });

  const remove = (c: ContractItem) => {
    if (!confirm(`Usunąć umowę „${c.title}”?`)) return;
    startTransition(async () => {
      const res = await deleteContract(c.id);
      if (res?.error) alert(res.error);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value as never)} className="h-10 w-auto">
            <option value="ALL">Wszystkie statusy</option>
            {CONTRACT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONTRACT_STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <span className="text-sm text-muted-foreground">
            {filtered.length} umów · łączna wartość {formatCurrency(totalValue)}
          </span>
        </div>
        {canManage && (
          <Button onClick={() => setCreating((c) => !c)}>
            {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {creating ? 'Anuluj' : 'Nowa umowa'}
          </Button>
        )}
      </div>

      {creating && canManage && (
        <Card className="p-4">
          <form action={action} className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input name="title" placeholder="Tytuł umowy *" required />
            </div>
            <Select name="status" defaultValue="DRAFT">
              {CONTRACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {CONTRACT_STATUS_META[s].label}
                </option>
              ))}
            </Select>
            <Input name="value" type="number" step="any" placeholder="Wartość (PLN)" />
            <Select name="locationId" defaultValue="">
              <option value="">Lokalizacja: — brak —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
            <Select name="investorId" defaultValue="">
              <option value="">Inwestor: — brak —</option>
              {investors.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Data wygaśnięcia</label>
              <Input name="expiresAt" type="date" />
            </div>
            {state?.error && (
              <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
            )}
            <div className="sm:col-span-2">
              <Button type="submit">Zapisz umowę</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y">
        {filtered.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <FileSignature className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  {c.value != null && <span className="font-medium text-foreground">{formatCurrency(c.value)}</span>}
                  {c.investorName && <span>{c.investorName}</span>}
                  {c.locationName && (
                    <Link href={`/locations/${c.locationId}`} className="flex items-center gap-1 text-primary hover:underline">
                      <MapPin className="h-3 w-3" /> {c.locationName}
                    </Link>
                  )}
                  {c.expiresAt && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" /> do {formatDate(c.expiresAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canManage ? (
                <Select
                  value={c.status}
                  onChange={(e) => move(c.id, e.target.value as ContractStatus)}
                  className="h-8 w-auto text-xs"
                  disabled={isPending}
                >
                  {CONTRACT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CONTRACT_STATUS_META[s].label}
                    </option>
                  ))}
                </Select>
              ) : (
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: CONTRACT_STATUS_META[c.status].color }}
                >
                  {CONTRACT_STATUS_META[c.status].label}
                </span>
              )}
              {canManage && (
                <Button variant="ghost" size="icon" onClick={() => remove(c)} disabled={isPending} aria-label="Usuń">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Brak umów.</p>}
      </Card>
    </div>
  );
}
