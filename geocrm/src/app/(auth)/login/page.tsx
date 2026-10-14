'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { authenticate, type FormState } from '@/app/actions/auth';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/auth/submit-button';
import { IS_DEMO } from '@/lib/demo-data';

function LoginForm() {
  const [state, formAction] = useActionState<FormState, FormData>(authenticate, undefined);
  const params = useSearchParams();

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Zaloguj się</h2>
      <p className="mt-1 text-sm text-muted-foreground">Witaj z powrotem w GeoCRM.</p>

      {params.get('registered') && (
        <p className="mt-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Konto utworzone — możesz się zalogować.
        </p>
      )}
      {params.get('reset') && (
        <p className="mt-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300">
          Hasło zmienione — zaloguj się nowym hasłem.
        </p>
      )}
      {IS_DEMO && (
        <p className="mt-4 rounded-md bg-sky-100 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          Tryb demo: <strong>admin@net4zero.pl</strong> / <strong>demo1234</strong>
        </p>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">E-mail</label>
          <Input name="email" type="email" placeholder="ty@net4zero.pl" required autoComplete="email" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium">Hasło</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Nie pamiętasz hasła?
            </Link>
          </div>
          <Input name="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
        </div>

        {state?.error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
        )}

        <SubmitButton>Zaloguj się</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Nie masz konta?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Zarejestruj się
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
