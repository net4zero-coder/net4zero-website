'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { locationSchema } from '@/lib/validations';
import { STATUS_META, LOCATION_TYPE_LABELS } from '@/lib/constants';
import { IS_DEMO } from '@/lib/demo-data';

export type LocationFormState = { error?: string } | undefined;

// Pola śledzone w historii zmian, z czytelnymi etykietami.
const labelFor = {
  name: 'Nazwa',
  status: 'Status',
  type: 'Typ',
  address: 'Adres',
  city: 'Miasto',
  voivodeship: 'Województwo',
  contactName: 'Osoba kontaktowa',
  contactPhone: 'Telefon',
  contactEmail: 'E-mail',
  ownerName: 'Właściciel',
  roi: 'ROI',
  forecastPackages: 'Prognoza opakowań',
  deviceNumber: 'Nr urządzenia',
} as const;

function humanValue(field: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (field === 'status') return STATUS_META[value as keyof typeof STATUS_META]?.label ?? String(value);
  if (field === 'type') return LOCATION_TYPE_LABELS[value as keyof typeof LOCATION_TYPE_LABELS] ?? String(value);
  return String(value);
}

/** Tworzy nową lokalizację (Etap 6). */
export async function createLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'locations:create')) {
    return { error: 'Brak uprawnień do dodawania lokalizacji.' };
  }

  const parsed = locationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.' };
  }

  if (IS_DEMO || !user.organizationId) {
    return {
      error:
        'Tryb demo — zapis lokalizacji wymaga skonfigurowanej bazy danych (DATABASE_URL). Dane nie zostały zapisane.',
    };
  }

  const d = parsed.data;
  await prisma.location.create({
    data: {
      organizationId: user.organizationId,
      createdById: user.id,
      name: d.name,
      address: d.address || null,
      city: d.city || null,
      voivodeship: d.voivodeship || null,
      postalCode: d.postalCode || null,
      latitude: d.latitude,
      longitude: d.longitude,
      status: d.status,
      type: d.type,
      description: d.description || null,
      contactName: d.contactName || null,
      contactPhone: d.contactPhone || null,
      contactEmail: d.contactEmail || null,
      ownerName: d.ownerName || null,
      roi: d.roi ?? null,
      forecastPackages: d.forecastPackages ?? null,
      deviceNumber: d.deviceNumber || null,
      regionId: d.regionId || null,
      agentId: d.agentId || null,
      investorId: d.investorId || null,
      operatorId: d.operatorId || null,
    },
  });

  redirect('/locations');
}

/** Aktualizuje lokalizację (Etap 6) i zapisuje historię zmian pól. */
export async function updateLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'locations:edit')) {
    return { error: 'Brak uprawnień do edycji lokalizacji.' };
  }

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { error: 'Brak identyfikatora lokalizacji.' };

  const parsed = locationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.' };
  }

  if (IS_DEMO || !user.organizationId) {
    return {
      error: 'Tryb demo — zapis zmian wymaga skonfigurowanej bazy danych (DATABASE_URL).',
    };
  }

  const existing = await prisma.location.findFirst({
    where: { id, organizationId: user.organizationId },
  });
  if (!existing) return { error: 'Nie znaleziono lokalizacji.' };

  const d = parsed.data;
  const next = {
    name: d.name,
    address: d.address || null,
    city: d.city || null,
    voivodeship: d.voivodeship || null,
    postalCode: d.postalCode || null,
    latitude: d.latitude,
    longitude: d.longitude,
    status: d.status,
    type: d.type,
    description: d.description || null,
    contactName: d.contactName || null,
    contactPhone: d.contactPhone || null,
    contactEmail: d.contactEmail || null,
    ownerName: d.ownerName || null,
    roi: d.roi ?? null,
    forecastPackages: d.forecastPackages ?? null,
    deviceNumber: d.deviceNumber || null,
  };

  // Wylicz zmiany pól do historii.
  const historyEntries = (Object.keys(labelFor) as (keyof typeof labelFor)[])
    .filter((field) => {
      const before = existing[field as keyof typeof existing];
      const after = next[field as keyof typeof next];
      return String(before ?? '') !== String(after ?? '');
    })
    .map((field) => ({
      locationId: id,
      userId: user.id,
      field: labelFor[field],
      oldValue: humanValue(field, existing[field as keyof typeof existing]),
      newValue: humanValue(field, next[field as keyof typeof next]),
    }));

  await prisma.$transaction([
    prisma.location.update({ where: { id }, data: next }),
    ...(historyEntries.length
      ? [prisma.locationHistory.createMany({ data: historyEntries })]
      : []),
    prisma.activity.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        type: 'LOCATION_UPDATED',
        message: `Zaktualizowano lokalizację: ${d.name}`,
        entityType: 'Location',
        entityId: id,
      },
    }),
  ]);

  revalidatePath(`/locations/${id}`);
  revalidatePath('/locations');
  redirect(`/locations/${id}`);
}
