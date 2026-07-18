import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@prisma/client';

/**
 * Edge-safe konfiguracja Auth.js (bez Prismy i bcrypt) — używana przez
 * middleware do ochrony tras. Pełna konfiguracja (z providerem Credentials)
 * znajduje się w `auth.ts` i działa w środowisku Node.
 */

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Tryb demo (brak bazy) — aplikacja dostępna bez ściany logowania, aby można
// było ją od razu podejrzeć na Vercel z samym kluczem Google Maps.
const IS_DEMO = !process.env.DATABASE_URL;

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [], // uzupełniane w auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // W trybie demo nie blokujemy żadnych tras.
      if (IS_DEMO) return true;

      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

      // Zalogowany użytkownik na stronie publicznej → przekieruj do panelu
      if (isLoggedIn && isPublic) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Trasy publiczne dostępne dla wszystkich
      if (isPublic) return true;

      // Pozostałe trasy wymagają zalogowania
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.organizationId = (token.organizationId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
