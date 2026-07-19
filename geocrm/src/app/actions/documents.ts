'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';
import { categoryFromName } from '@/lib/storage';

export type DocumentFormState = { error?: string; success?: string } | undefined;

const documentSchema = z.object({
  name: z.string().min(2, 'Nazwa dokumentu jest wymagana'),
  url: z.string().url('Podaj prawidłowy URL do pliku'),
  category: z.enum(['PDF', 'WORD', 'EXCEL', 'IMAGE', 'OTHER']).optional(),
  locationId: z.string().optional(),
});

/** Rejestruje dokument (metadane). Fizyczny upload do storage — kolejna iteracja. */
export async function createDocument(_prev: DocumentFormState, formData: FormData): Promise<DocumentFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'documents:manage')) {
    return { error: 'Brak uprawnień do zarządzania dokumentami.' };
  }

  const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — zapis dokumentu wymaga bazy danych (DATABASE_URL).' };
  }

  const d = parsed.data;
  await prisma.document.create({
    data: {
      organizationId: user.organizationId,
      uploadedById: user.id,
      name: d.name,
      url: d.url,
      category: d.category ?? categoryFromName(d.name),
      locationId: d.locationId || null,
    },
  });

  revalidatePath('/documents');
  return { success: 'Dokument dodany.' };
}

export async function deleteDocument(id: string): Promise<DocumentFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'documents:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — usuwanie wymaga bazy danych.' };

  await prisma.document.delete({ where: { id, organizationId: user.organizationId } });
  revalidatePath('/documents');
  return { success: 'Dokument usunięty.' };
}
