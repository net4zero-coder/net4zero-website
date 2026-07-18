'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { initials } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import type { Role } from '@prisma/client';

interface TopbarProps {
  user: { name?: string | null; email?: string | null; role: Role };
  signOutAction: () => Promise<void>;
}

export function Topbar({ user, signOutAction }: TopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
          N4Z
        </div>
        <span className="font-semibold">GeoCRM</span>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-secondary"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
              {initials(user.name)}
            </span>
            <span className="hidden text-sm font-medium sm:block">{user.name ?? user.email}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 animate-fade-in rounded-lg border bg-popover p-1 shadow-lg">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{ROLE_LABELS[user.role]}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <Link
                  href="/settings"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-secondary"
                  onClick={() => setOpen(false)}
                >
                  <UserIcon className="h-4 w-4" /> Profil
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-secondary"
                  >
                    <LogOut className="h-4 w-4" /> Wyloguj
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
