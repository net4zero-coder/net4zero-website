'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { createLocation, updateLocation, type LocationFormState } from '@/app/actions/locations';
import { Input, Select } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocationPicker } from '@/components/locations/location-picker';
import { cn } from '@/lib/utils';
import { LOCATION_STATUSES, STATUS_META, LOCATION_TYPE_LABELS } from '@/lib/constants';
import type { LocationDetail, LocationType } from '@/types';

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-medium">{children}</label>;
}

export function LocationForm({ initial }: { initial?: LocationDetail }) {
  const isEdit = !!initial;
  const [state, formAction] = useActionState<LocationFormState, FormData>(
    isEdit ? updateLocation : createLocation,
    undefined,
  );

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
      {isEdit && <input type="hidden" name="id" value={initial.id} />}

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Podstawowe dane</h2>
        <div>
          <Label>Nazwa *</Label>
          <Input name="name" required defaultValue={initial?.name ?? ''} placeholder="np. Osiedle Reja 15" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Status</Label>
            <Select name="status" defaultValue={initial?.status ?? 'FREE'}>
              {LOCATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Typ lokalizacji</Label>
            <Select name="type" defaultValue={initial?.type ?? 'OSIEDLE'}>
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
            defaultValue={initial?.description ?? ''}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Notatki o potencjale lokalizacji…"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Adres i lokalizacja na mapie</h2>
        <LocationPicker
          defaultAddress={initial?.address ?? ''}
          defaultCity={initial?.city ?? ''}
          defaultVoivodeship={initial?.voivodeship ?? ''}
          defaultPostalCode={initial?.postalCode ?? ''}
          defaultLat={initial?.latitude}
          defaultLng={initial?.longitude}
        />
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-semibold">Kontakt i parametry biznesowe</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Osoba kontaktowa</Label>
            <Input name="contactName" defaultValue={initial?.contactName ?? ''} />
          </div>
          <div>
            <Label>Właściciel terenu</Label>
            <Input name="ownerName" defaultValue={initial?.ownerName ?? ''} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input name="contactPhone" defaultValue={initial?.contactPhone ?? ''} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input name="contactEmail" type="email" defaultValue={initial?.contactEmail ?? ''} />
          </div>
          <div>
            <Label>ROI (%)</Label>
            <Input name="roi" type="number" step="any" defaultValue={initial?.roi ?? ''} />
          </div>
          <div>
            <Label>Prognoza opakowań / mc</Label>
            <Input name="forecastPackages" type="number" defaultValue={initial?.forecastPackages ?? ''} />
          </div>
          <div>
            <Label>Numer urządzenia</Label>
            <Input name="deviceNumber" defaultValue={initial?.deviceNumber ?? ''} />
          </div>
        </div>
      </Card>

      {state?.error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
      )}

      <div className="flex justify-end gap-2">
        <Link
          href={isEdit ? `/locations/${initial.id}` : '/locations'}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          Anuluj
        </Link>
        <Button type="submit">{isEdit ? 'Zapisz zmiany' : 'Zapisz lokalizację'}</Button>
      </div>
    </form>
  );
}
