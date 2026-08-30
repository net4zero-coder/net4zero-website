'use client';

import { Suspense, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { resetPassword, type FormState } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';

function ResetForm() {
  const [state, formAction] = useActionState<FormState, FormData>(resetPassword, undefined);
  const token = useSearchParams().get('token') ?? '';

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Nowe hasło</h2>
      <p className="mt-1 text-sm text-muted-foreground">Ustaw nowe hasło do swojego konta.</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nowe hasło</label>
          <Input name="password" type="password" placeholder="min. 8 znaków" required autoComplete="new-password" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Powtórz hasło</label>
          <Input name="confirmPassword" type="password" required autoComplete="new-password" />
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <SubmitButton>Zapisz hasło</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Wróć do logowania
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
