'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export type UserFormState = { error?: string; success?: string } | undefined;

const userSchema = z.object({
  name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
  email: z.string().email('Nieprawidłowy adres e-mail'),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'INVESTOR', 'SERVICE']),
  password: z.string().min(8, 'Hasło startowe musi mieć min. 8 znaków'),
});

export async function createUser(_prev: UserFormState, formData: FormData): Promise<UserFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'users:manage')) {
    return { error: 'Brak uprawnień do zarządzania użytkownikami.' };
  }

  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — dodanie użytkownika wymaga bazy danych (DATABASE_URL).' };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: 'Użytkownik z tym adresem e-mail już istnieje.' };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      organizationId: user.organizationId,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath('/settings');
  return { success: 'Użytkownik dodany.' };
}

export async function updateUserRole(id: string, role: Role): Promise<UserFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'users:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — zmiana roli wymaga bazy danych.' };
  if (id === user.id) return { error: 'Nie możesz zmienić własnej roli.' };

  await prisma.user.update({ where: { id, organizationId: user.organizationId }, data: { role } });
  revalidatePath('/settings');
  return { success: 'Rola zaktualizowana.' };
}

export async function toggleUserActive(id: string, active: boolean): Promise<UserFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'users:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — zmiana statusu wymaga bazy danych.' };
  if (id === user.id) return { error: 'Nie możesz dezaktywować własnego konta.' };

  await prisma.user.update({ where: { id, organizationId: user.organizationId }, data: { active } });
  revalidatePath('/settings');
  return { success: active ? 'Konto aktywowane.' : 'Konto dezaktywowane.' };
}
