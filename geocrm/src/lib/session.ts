import { redirect } from 'next/navigation';
import { auth } from './auth';
import { IS_DEMO, DEMO_SESSION_USER } from './demo-data';

/**
 * Zwraca aktualnego użytkownika (server-side). W trybie demo (brak DATABASE_URL)
 * zwraca konto demonstracyjne, aby aplikację można było uruchomić bez bazy.
 */
export async function getCurrentUser() {
  if (IS_DEMO) return DEMO_SESSION_USER;
  const session = await auth();
  return session?.user ?? null;
}

/** Wymusza zalogowanie — przekierowuje do /login jeśli brak sesji. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
