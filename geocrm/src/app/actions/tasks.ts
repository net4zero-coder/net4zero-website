'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { TaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export type TaskFormState = { error?: string; success?: string } | undefined;

const taskSchema = z.object({
  title: z.string().min(2, 'Tytuł zadania jest wymagany'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  locationId: z.string().optional(),
});

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'tasks:manage')) {
    return { error: 'Brak uprawnień do zarządzania zadaniami.' };
  }

  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — zapis zadania wymaga bazy danych (DATABASE_URL).' };
  }

  const d = parsed.data;
  await prisma.task.create({
    data: {
      organizationId: user.organizationId,
      createdById: user.id,
      title: d.title,
      description: d.description || null,
      priority: d.priority,
      dueDate: d.dueDate ? new Date(d.dueDate) : null,
      assigneeId: d.assigneeId || null,
      locationId: d.locationId || null,
    },
  });

  revalidatePath('/tasks');
  return { success: 'Zadanie utworzone.' };
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<TaskFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'tasks:manage')) {
    return { error: 'Brak uprawnień.' };
  }
  if (IS_DEMO || !user.organizationId) {
    return { error: 'Tryb demo — zmiana statusu wymaga bazy danych.' };
  }

  await prisma.task.update({
    where: { id, organizationId: user.organizationId },
    data: { status, completedAt: status === 'DONE' ? new Date() : null },
  });
  revalidatePath('/tasks');
  return { success: 'Status zaktualizowany.' };
}

export async function deleteTask(id: string): Promise<TaskFormState> {
  const user = await getCurrentUser();
  if (!user || !can(user.role, 'tasks:manage')) return { error: 'Brak uprawnień.' };
  if (IS_DEMO || !user.organizationId) return { error: 'Tryb demo — usuwanie wymaga bazy danych.' };

  await prisma.task.delete({ where: { id, organizationId: user.organizationId } });
  revalidatePath('/tasks');
  return { success: 'Zadanie usunięte.' };
}
