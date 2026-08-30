import { Building2, KeyRound } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersManager } from '@/components/settings/users-manager';
import { getCurrentUser } from '@/lib/session';
import { getUsers } from '@/lib/queries';
import { can } from '@/lib/rbac';
import { IS_DEMO } from '@/lib/demo-data';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const users = await getUsers(user?.organizationId ?? null);
  const canManage = can(user?.role, 'users:manage');

  return (
    <div>
      <PageHeader title="Ustawienia" description="Zarządzanie użytkownikami, rolami i konfiguracją organizacji." />
      <div className="space-y-6 p-4 lg:p-8">
        {IS_DEMO && (
          <Card className="border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <KeyRound className="mt-0.5 h-4 w-4 text-sky-600" />
              <p className="text-sky-800 dark:text-sky-300">
                Tryb demo — zmiany użytkowników nie są zapisywane. Po podłączeniu bazy (DATABASE_URL)
                zarządzanie kontami działa w pełni.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Organizacja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Nazwa</p>
                <p className="font-medium">NET4ZERO</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Twoja rola</p>
                <p className="font-medium">{user?.role}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Liczba kont</p>
                <p className="font-medium">{users.length}</p>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <UsersManager users={users} currentUserId={user?.id ?? ''} canManage={canManage} />
          </div>
        </div>
      </div>
    </div>
  );
}
