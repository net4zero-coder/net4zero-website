'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  List,
  Layers,
  Users,
  Briefcase,
  CheckSquare,
  FileText,
  BarChart3,
  Cpu,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { can, type Permission } from '@/lib/rbac';
import type { Role } from '@prisma/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  { href: '/map', label: 'Mapa', icon: Map, permission: 'locations:view' },
  { href: '/locations', label: 'Lokalizacje', icon: List, permission: 'locations:view' },
  { href: '/regions', label: 'Regiony', icon: Layers, permission: 'regions:view' },
  { href: '/investors', label: 'Inwestorzy', icon: Briefcase, permission: 'investors:view' },
  { href: '/agents', label: 'Handlowcy', icon: Users, permission: 'agents:view' },
  { href: '/tasks', label: 'Zadania', icon: CheckSquare, permission: 'tasks:view' },
  { href: '/documents', label: 'Dokumenty', icon: FileText, permission: 'documents:view' },
  { href: '/devices', label: 'Urządzenia', icon: Cpu, permission: 'devices:view' },
  { href: '/reports', label: 'Raporty', icon: BarChart3, permission: 'reports:view' },
  { href: '/settings', label: 'Ustawienia', icon: Settings, permission: 'settings:manage' },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => can(role, item.permission));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          N4Z
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">GeoCRM</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">NET4ZERO</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-[11px] text-muted-foreground">
        GeoCRM v0.1 · fundament
      </div>
    </aside>
  );
}
