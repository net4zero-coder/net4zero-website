import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Middleware oparte o edge-safe config (bez Prismy/bcrypt).
export default NextAuth(authConfig).auth;

export const config = {
  // Chroń wszystko poza zasobami statycznymi i API auth.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)'],
};
