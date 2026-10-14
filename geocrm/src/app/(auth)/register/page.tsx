'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerUser, type FormState } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

export default function RegisterPage() {
  const [state, formAction] = useActionState<FormState, FormData>(registerUser, undefined);

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Utwórz konto</h2>
      <p className="mt-1 text-sm text-muted-foreground">Załóż organizację i konto administratora.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Organizacja</label>
          <Input name="organizationName" placeholder="NET4ZERO Sp. z o.o." required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Imię i nazwisko</label>
          <Input name="name" placeholder="Jan Kowalski" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input name="email" type="email" placeholder="ty@net4zero.pl" required autoComplete="email" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Hasło</label>
            <Input name="password" type="password" placeholder="min. 8 znaków" required autoComplete="new-password" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Powtórz</label>
            <Input name="confirmPassword" type="password" required autoComplete="new-password" />
          </div>
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <SubmitButton>Zarejestruj się</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Zaloguj się
        </Link>
      </p>
    </div>
  );
}
