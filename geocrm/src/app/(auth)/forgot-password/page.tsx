'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset, type FormState } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<FormState, FormData>(requestPasswordReset, undefined);

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Reset hasła</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Podaj adres e-mail — wyślemy link do ustawienia nowego hasła.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input name="email" type="email" placeholder="ty@net4zero.pl" required autoComplete="email" />
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}
        {state?.success && (
          <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
            {state.success}
          </p>
        )}

        <SubmitButton>Wyślij link</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </div>
  );
}
