import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { getCurrentUser } from '@/lib/session';
import { signOut } from '@/lib/auth';
import { IS_DEMO } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  async function signOutAction() {
    'use server';
    if (IS_DEMO) redirect('/login');
    await signOut({ redirectTo: '/login' });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={user} signOutAction={signOutAction} />
        <main className="flex-1 overflow-y-auto pb-16 scrollbar-thin lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
