'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createLocation, type LocationFormState } from '@/app/actions/locations';
import { Input, Select } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocationPicker } from '@/components/locations/location-picker';
import { cn } from '@/lib/utils';
import { LOCATION_STATUSES, STATUS_META, LOCATION_TYPE_LABELS } from '@/lib/constants';
import type { LocationType } from '@/types';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium">{children}</label>;
}

export default function NewLocationPage() {
  const [state, formAction] = useActionState<LocationFormState, FormData>(createLocation, undefined);

  return (
    <div>
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:px-8">
        <Link href="/locations" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          <ArrowLeft className="h-4 w-4" /> Lokalizacje
        </Link>
        <h1 className="text-lg font-semibold">Nowa lokalizacja</h1>
      </div>

      <form action={formAction} className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Podstawowe dane</h2>
          <div>
            <Label>Nazwa *</Label>
            <Input name="name" required placeholder="np. Osiedle Reja 15" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue="FREE">
                {LOCATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Typ lokalizacji</Label>
              <Select name="type" defaultValue="OSIEDLE">
                {(Object.keys(LOCATION_TYPE_LABELS) as LocationType[]).map((t) => (
                  <option key={t} value={t}>
                    {LOCATION_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Opis</Label>
            <textarea
              name="description"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Notatki o potencjale lokalizacji…"
            />
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Adres i lokalizacja na mapie</h2>
          <LocationPicker />
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold">Kontakt i parametry biznesowe</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Osoba kontaktowa</Label>
              <Input name="contactName" />
            </div>
            <div>
              <Label>Właściciel terenu</Label>
              <Input name="ownerName" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input name="contactPhone" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input name="contactEmail" type="email" />
            </div>
            <div>
              <Label>ROI (%)</Label>
              <Input name="roi" type="number" step="any" />
            </div>
            <div>
              <Label>Prognoza opakowań / mc</Label>
              <Input name="forecastPackages" type="number" />
            </div>
            <div>
              <Label>Numer urządzenia</Label>
              <Input name="deviceNumber" />
            </div>
          </div>
        </Card>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-2">
          <Link href="/locations" className={cn(buttonVariants({ variant: 'outline' }))}>
            Anuluj
          </Link>
          <Button type="submit">Zapisz lokalizację</Button>
        </div>
      </form>
    </div>
  );
}
