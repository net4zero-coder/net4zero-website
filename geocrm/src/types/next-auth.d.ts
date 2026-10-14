import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    organizationId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
  }
}

// Auth.js v5 źródłuje typ JWT z @auth/core/jwt — augmentujemy oba.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: Role;
    organizationId: string | null;
  }
}
