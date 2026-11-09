'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ContractStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export type ContractFormState = { error?: string; success?: string } | undefined;

const contractSchema = z.object({
  title: z.string().min(2, 'Tytuł umowy jest wymagany'),
  status: z.enum(['DRAFT', 'SENT', 'SIGNED', 'EXPIRED', 'TERMINATED']),
  value: z.coerce.number().optional(),
  locationId: z.string().optional(),
  investorId: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function createContract(_prev: ContractFormState, formData: FormData): Promise<ContractFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'contracts:manage')) {
    return { error: 'Brak uprawnień do zarządzania umowami.' };
  }

  const parsed = contractSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — zapis umowy wymaga bazy danych (DATABASE_URL).' };
  }

  const d = parsed.data;
  await prisma.contract.create({
    data: {
      organizationId: user.organizationId,
      title: d.title,
      status: d.status,
      value: d.value ?? null,
      locationId: d.locationId || null,
      investorId: d.investorId || null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      signedAt: d.status === 'SIGNED' ? new Date() : null,
    },
  });

  revalidatePath('/contracts');
  revalidatePath('/dashboard');
  return { success: 'Umowa dodana.' };
}

export async function updateContractStatus(id: string, status: ContractStatus): Promise<ContractFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'contracts:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — zmiana statusu wymaga bazy danych.' };

  await prisma.contract.update({
    where: { id, organizationId: user.organizationId },
    data: { status, ...(status === 'SIGNED' ? { signedAt: new Date() } : {}) },
  });
  revalidatePath('/contracts');
  revalidatePath('/dashboard');
  return { success: 'Status umowy zaktualizowany.' };
}

export async function deleteContract(id: string): Promise<ContractFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'contracts:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — usuwanie wymaga bazy danych.' };

  await prisma.contract.delete({ where: { id, organizationId: user.organizationId } });
  revalidatePath('/contracts');
  revalidatePath('/dashboard');
  return { success: 'Umowa usunięta.' };
}
