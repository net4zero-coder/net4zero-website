'use server';

import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { signIn } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IS_DEMO } from '@/lib/demo-data';
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validations';

export type FormState = { error?: string; success?: string } | undefined;

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

/** Logowanie (Credentials). */
export async function authenticate(_prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Nieprawidłowy e-mail lub hasło.' };
    }
    throw error; // przekierowanie NextAuth
  }
  return undefined;
}

/** Rejestracja — tworzy organizację i konto administratora. */
export async function registerUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Nieprawidłowe dane.' };
  }

  if (IS_DEMO) {
    return {
      error:
        'Rejestracja wymaga skonfigurowanej bazy danych (DATABASE_URL). W trybie demo zaloguj się kontem admin@net4zero.pl / demo1234.',
    };
  }

  const { name, email, password, organizationName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Użytkownik z tym adresem e-mail już istnieje.' };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let slug = slugify(organizationName);
  if (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  await prisma.organization.create({
    data: {
      name: organizationName,
      slug,
      users: {
        create: { name, email, passwordHash, role: 'ADMIN' },
      },
    },
  });

  redirect('/login?registered=1');
}

/** Żądanie resetu hasła — generuje token (integracja e-mail w Etapie 12). */
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  // Zawsze zwracamy sukces (brak enumeracji użytkowników).
  const genericSuccess = {
    success: 'Jeśli konto istnieje, wysłaliśmy link do resetu hasła na podany adres.',
  };

  if (IS_DEMO) return genericSuccess;

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expires } });
    // TODO(Etap 12): wysyłka e-maila z linkiem /reset-password?token=...
  }

  return genericSuccess;
}

/** Ustawienie nowego hasła na podstawie tokenu. */
export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  if (IS_DEMO) {
    return { error: 'Reset hasła wymaga skonfigurowanej bazy danych.' };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.used || record.expires < new Date()) {
    return { error: 'Link resetujący jest nieprawidłowy lub wygasł.' };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);

  redirect('/login?reset=1');
}
