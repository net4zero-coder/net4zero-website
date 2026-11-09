import { Users, MapPin, Layers, FileSignature, CheckSquare, Package, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { formatNumber, initials } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { getAgents } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  const user = await getCurrentUser();
  const agents = await getAgents(user?.organizationId ?? null);
  // Ranking wg liczby podpisanych lokalizacji.
  const ranked = [...agents].sort((a, b) => b.signedCount - a.signedCount);

  return (
    <div>
      <PageHeader title="Handlowcy" description="Portfele, statystyki i ranking zespołu sprzedaży." />
      <div className="space-y-4 p-4 lg:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ranked.map((a, idx) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {initials(a.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                </div>
                {idx === 0 && a.signedCount > 0 && (
                  <span className="ml-auto flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400">
                    <Trophy className="h-3 w-3" /> #1
                  </span>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Stat icon={MapPin} label="Lokalizacje" value={a.locationCount} />
                <Stat icon={Layers} label="Regiony" value={a.regionCount} />
                <Stat icon={FileSignature} label="Podpisane" value={a.signedCount} />
                <Stat icon={CheckSquare} label="Otwarte zadania" value={a.openTasks} />
              </div>
              <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                Prognoza: {formatNumber(a.forecastPackages)} opakowań / mc
              </div>
            </Card>
          ))}
        </div>
        {agents.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 h-6 w-6" /> Brak handlowców.
          </Card>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="font-semibold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
