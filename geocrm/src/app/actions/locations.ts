'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { locationSchema } from '@/lib/validations';
import { IS_DEMO } from '@/lib/demo-data';

export type LocationFormState = { error?: string } | undefined;

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
