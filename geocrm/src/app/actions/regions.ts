'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';
import { pointInPolygon } from '@/lib/geo';
import type { GeoJSONPolygon } from '@/types';

export type RegionFormState = { error?: string; success?: string } | undefined;

const regionSchema = z.object({
  name: z.string().min(2, 'Nazwa regionu jest wymagana'),
  type: z.enum(['WOJEWODZTWO', 'POWIAT', 'MIASTO', 'CUSTOM']),
  color: z.string().optional(),
  agentId: z.string().optional(),
  investorId: z.string().optional(),
  geometry: z.string().optional(), // JSON GeoJSON Polygon
});

function parseGeometry(raw?: string): GeoJSONPolygon | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.type === 'Polygon' && Array.isArray(parsed.coordinates)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Po utworzeniu/edycji regionu CUSTOM przypisuje do niego lokalizacje,
 * których współrzędne leżą wewnątrz narysowanego obszaru (point-in-polygon).
 */
async function autoAssignLocations(orgId: string, regionId: string, geometry: GeoJSONPolygon) {
  const locations = await prisma.location.findMany({
    where: { organizationId: orgId },
    select: { id: true, latitude: true, longitude: true },
  });
  const inside = locations.filter((l) => pointInPolygon(l.latitude, l.longitude, geometry));
  if (inside.length === 0) return 0;
  await prisma.location.updateMany({
    where: { id: { in: inside.map((l) => l.id) } },
    data: { regionId },
  });
  return inside.length;
}

export async function createRegion(_prev: RegionFormState, formData: FormData): Promise<RegionFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'regions:manage')) {
    return { error: 'Brak uprawnień do zarządzania regionami.' };
  }

  const parsed = regionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const geometry = parseGeometry(parsed.data.geometry);
  if (parsed.data.type === 'CUSTOM' && !geometry) {
    return { error: 'Narysuj obszar regionu na mapie przed zapisem.' };
  }

  if (IS_DEMO || !user.organizationId) {
    return {
      error: 'Tryb demo — zapis regionu wymaga bazy danych (DATABASE_URL). Region nie został zapisany.',
    };
  }

  const region = await prisma.region.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.data.name,
      type: parsed.data.type,
      color: parsed.data.color || '#4CAF50',
      agentId: parsed.data.agentId || null,
      investorId: parsed.data.investorId || null,
      geometry: geometry ? (geometry as unknown as Prisma.InputJsonValue) : undefined,
    },
  });

  let assigned = 0;
  if (geometry) assigned = await autoAssignLocations(user.organizationId, region.id, geometry);

  revalidatePath('/regions');
  revalidatePath('/map');
  return { success: `Region zapisany. Przypisano lokalizacji: ${assigned}.` };
}

export async function updateRegion(_prev: RegionFormState, formData: FormData): Promise<RegionFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'regions:manage')) {
    return { error: 'Brak uprawnień do zarządzania regionami.' };
  }

  const id = formData.get('id');
  if (typeof id !== 'string' || !id) return { error: 'Brak identyfikatora regionu.' };

  const parsed = regionSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — edycja regionu wymaga bazy danych.' };
  }

  const geometry = parseGeometry(parsed.data.geometry);
  await prisma.region.update({
    where: { id, organizationId: user.organizationId },
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      agentId: parsed.data.agentId || null,
      investorId: parsed.data.investorId || null,
      ...(geometry ? { geometry: geometry as unknown as Prisma.InputJsonValue } : {}),
    },
  });

  if (geometry) await autoAssignLocations(user.organizationId, id, geometry);

  revalidatePath('/regions');
  revalidatePath('/map');
  return { success: 'Region zaktualizowany.' };
}

export async function deleteRegion(id: string): Promise<RegionFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'regions:manage')) {
    return { error: 'Brak uprawnień do zarządzania regionami.' };
  }
  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — usuwanie regionu wymaga bazy danych.' };
  }

  await prisma.region.delete({ where: { id, organizationId: user.organizationId } });
  revalidatePath('/regions');
  revalidatePath('/map');
  return { success: 'Region usunięty.' };
}
