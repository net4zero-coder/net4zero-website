import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

import { authConfig } from './auth.config';
import { prisma } from './prisma';
import { loginSchema } from './validations';
import { IS_DEMO, DEMO_CREDENTIALS, DEMO_SESSION_USER } from './demo-data';

/**
 * Pełna konfiguracja Auth.js (Node runtime) — provider Credentials z bcrypt.
 * Sesje JWT (kompatybilne z credentials). Role i organizationId trafiają do
 * tokenu w callbacku `jwt` (patrz auth.config.ts).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Hasło', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Tryb demo — logowanie kontem demonstracyjnym bez bazy.
        if (IS_DEMO) {
          if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
            return { ...DEMO_SESSION_USER };
          }
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash || !user.active) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
});
