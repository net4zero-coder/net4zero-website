'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export type DetailFormState = { error?: string; success?: string } | undefined;

const DEMO_MSG = 'Tryb demo — zapis wymaga skonfigurowanej bazy danych (DATABASE_URL).';

const noteSchema = z.object({
  locationId: z.string().min(1),
  body: z.string().min(1, 'Treść notatki jest wymagana'),
});

const contactSchema = z.object({
  locationId: z.string().min(1),
  name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
  role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Nieprawidłowy e-mail').optional().or(z.literal('')),
});

/** Weryfikuje uprawnienia i przynależność lokalizacji do organizacji. */
async function guard(locationId: string) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'locations:edit')) {
    return { error: 'Brak uprawnień.' as const };
  }
  if (IS_DEMO || !user.organizationId) return { error: DEMO_MSG };
  const loc = await prisma.location.findFirst({
    where: { id: locationId, organizationId: user.organizationId },
    select: { id: true, name: true },
  });
  if (!loc) return { error: 'Nie znaleziono lokalizacji.' as const };
  return { user, loc };
}

export async function addNote(_prev: DetailFormState, formData: FormData): Promise<DetailFormState> {
  const parsed = noteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const g = await guard(parsed.data.locationId);
  if ('error' in g) return { error: g.error };

  await prisma.$transaction([
    prisma.note.create({
      data: { locationId: parsed.data.locationId, authorId: g.user.id, body: parsed.data.body },
    }),
    prisma.activity.create({
      data: {
        organizationId: g.user.organizationId!,
        userId: g.user.id,
        type: 'NOTE_ADDED',
        message: `Notatka do: ${g.loc.name}`,
        entityType: 'Location',
        entityId: parsed.data.locationId,
      },
    }),
  ]);

  revalidatePath(`/locations/${parsed.data.locationId}`);
  return { success: 'Notatka dodana.' };
}

export async function deleteNote(id: string, locationId: string): Promise<DetailFormState> {
  const g = await guard(locationId);
  if ('error' in g) return { error: g.error };
  await prisma.note.delete({ where: { id } });
  revalidatePath(`/locations/${locationId}`);
  return { success: 'Notatka usunięta.' };
}

export async function addContact(_prev: DetailFormState, formData: FormData): Promise<DetailFormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const g = await guard(parsed.data.locationId);
  if ('error' in g) return { error: g.error };

  await prisma.contact.create({
    data: {
      locationId: parsed.data.locationId,
      name: parsed.data.name,
      role: parsed.data.role || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
    },
  });

  revalidatePath(`/locations/${parsed.data.locationId}`);
  return { success: 'Kontakt dodany.' };
}

export async function deleteContact(id: string, locationId: string): Promise<DetailFormState> {
  const g = await guard(locationId);
  if ('error' in g) return { error: g.error };
  await prisma.contact.delete({ where: { id } });
  revalidatePath(`/locations/${locationId}`);
  return { success: 'Kontakt usunięty.' };
}
