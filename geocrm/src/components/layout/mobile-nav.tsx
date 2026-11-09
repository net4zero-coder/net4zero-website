'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, List, CheckSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/map', label: 'Mapa', icon: Map },
  { href: '/locations', label: 'Lista', icon: List },
  { href: '/tasks', label: 'Zadania', icon: CheckSquare },
  { href: '/reports', label: 'Raporty', icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t bg-card lg:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
              active ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
