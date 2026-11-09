'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { DeviceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export type DeviceFormState = { error?: string; success?: string } | undefined;

const deviceSchema = z.object({
  serialNumber: z.string().min(2, 'Numer seryjny jest wymagany'),
  model: z.string().optional(),
  status: z.enum(['PLANNED', 'INSTALLED', 'ACTIVE', 'MAINTENANCE', 'INACTIVE']),
  locationId: z.string().optional(),
});

export async function createDevice(_prev: DeviceFormState, formData: FormData): Promise<DeviceFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'devices:manage')) {
    return { error: 'Brak uprawnień do zarządzania urządzeniami.' };
  }

  const parsed = deviceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — zapis urządzenia wymaga bazy danych (DATABASE_URL).' };
  }

  const d = parsed.data;
  await prisma.device.create({
    data: {
      organizationId: user.organizationId,
      serialNumber: d.serialNumber,
      model: d.model || null,
      status: d.status,
      locationId: d.locationId || null,
      installedAt: ['INSTALLED', 'ACTIVE'].includes(d.status) ? new Date() : null,
    },
  });

  revalidatePath('/devices');
  return { success: 'Urządzenie dodane.' };
}

export async function updateDeviceStatus(id: string, status: DeviceStatus): Promise<DeviceFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'devices:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — zmiana statusu wymaga bazy danych.' };

  await prisma.device.update({
    where: { id, organizationId: user.organizationId },
    data: {
      status,
      ...(status === 'MAINTENANCE' ? { lastServiceAt: new Date() } : {}),
    },
  });
  revalidatePath('/devices');
  return { success: 'Status urządzenia zaktualizowany.' };
}

export async function deleteDevice(id: string): Promise<DeviceFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'devices:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — usuwanie wymaga bazy danych.' };

  await prisma.device.delete({ where: { id, organizationId: user.organizationId } });
  revalidatePath('/devices');
  return { success: 'Urządzenie usunięte.' };
}
