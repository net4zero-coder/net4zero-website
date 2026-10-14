'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, UserPlus, ShieldCheck, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, initials } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import { createUser, updateUserRole, toggleUserActive, type UserFormState } from '@/app/actions/users';
import type { Role, UserItem } from '@/types';

const ROLES: Role[] = ['ADMIN', 'MANAGER', 'SALES', 'INVESTOR', 'SERVICE'];

export function UsersManager({
  users,
  currentUserId,
  canManage,
}: {
  users: UserItem[];
  currentUserId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, action] = useActionState<UserFormState, FormData>(createUser, undefined);

  useEffect(() => {
    if (state?.success) {
      setCreating(false);
      router.refresh();
    }
  }, [state?.success, router]);

  const changeRole = (id: string, role: Role) =>
    startTransition(async () => {
      const res = await updateUserRole(id, role);
      if (res?.error) alert(res.error);
      router.refresh();
    });

  const toggle = (u: UserItem) =>
    startTransition(async () => {
      const res = await toggleUserActive(u.id, !u.active);
      if (res?.error) alert(res.error);
      router.refresh();
    });

  return (
    <Card>
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h2 className="font-semibold">Użytkownicy ({users.length})</h2>
          <p className="text-xs text-muted-foreground">Zarządzaj dostępem zespołu i rolami.</p>
        </div>
        {canManage && (
          <Button onClick={() => setCreating((c) => !c)}>
            {creating ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {creating ? 'Anuluj' : 'Dodaj użytkownika'}
          </Button>
        )}
      </div>

      {creating && canManage && (
        <form action={action} className="grid gap-3 border-b p-4 sm:grid-cols-2">
          <Input name="name" placeholder="Imię i nazwisko *" required />
          <Input name="email" type="email" placeholder="E-mail *" required />
          <Select name="role" defaultValue="SALES">
            {ROLES.map((r) => (
              <option key={r} value={r}>
                Rola: {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          <Input name="password" type="password" placeholder="Hasło startowe (min. 8 znaków) *" required />
          {state?.error && (
            <p className="sm:col-span-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{state.error}</p>
          )}
          <div className="sm:col-span-2">
            <Button type="submit">Utwórz konto</Button>
          </div>
        </form>
      )}

      <div className="divide-y">
        {users.map((u) => (
          <div key={u.id} className={cn('flex flex-wrap items-center justify-between gap-3 p-4', !u.active && 'opacity-60')}>
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                {initials(u.name)}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {u.name ?? '—'}
                  {u.id === currentUserId && <span className="rounded bg-secondary px-1.5 text-[10px] text-muted-foreground">Ty</span>}
                  {!u.active && <span className="rounded bg-destructive/10 px-1.5 text-[10px] text-destructive">nieaktywny</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canManage ? (
                <>
                  <Select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value as Role)}
                    className="h-8 w-auto text-xs"
                    disabled={isPending || u.id === currentUserId}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggle(u)}
                    disabled={isPending || u.id === currentUserId}
                    aria-label={u.active ? 'Dezaktywuj' : 'Aktywuj'}
                    title={u.active ? 'Dezaktywuj' : 'Aktywuj'}
                  >
                    <Power className={cn('h-4 w-4', u.active ? 'text-green-600' : 'text-muted-foreground')} />
                  </Button>
                </>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" /> {ROLE_LABELS[u.role]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
