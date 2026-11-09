import {
  MapPin,
  Briefcase,
  Layers,
  FileSignature,
  Cpu,
  Wrench,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { StatusPie, MonthlyProgress, TopRegions } from '@/components/dashboard/charts';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { getCurrentUser } from '@/lib/session';
import { getDashboardStats, getRecentActivities } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [stats, activities] = await Promise.all([
    getDashboardStats(orgId),
    getRecentActivities(orgId),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description="Przegląd kluczowych wskaźników sieci recyklomatów." />

      <div className="space-y-6 p-4 lg:p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          <StatCard label="Lokalizacje" value={stats.locations} icon={MapPin} />
          <StatCard label="Aktywni inwestorzy" value={stats.activeInvestors} icon={Briefcase} accentClass="text-accent" />
          <StatCard label="Regiony" value={stats.regions} icon={Layers} accentClass="text-violet-500" />
          <StatCard label="Podpisane umowy" value={stats.signedContracts} icon={FileSignature} accentClass="text-green-600" />
          <StatCard label="Automaty" value={stats.devices} icon={Cpu} accentClass="text-sky-500" />
          <StatCard label="Instalacje" value={stats.installations} icon={Wrench} accentClass="text-sky-500" />
          <StatCard label="W negocjacjach" value={stats.inNegotiation} icon={Handshake} accentClass="text-yellow-500" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MonthlyProgress data={stats.monthlyProgress} />
          </div>
          <StatusPie data={stats.statusBreakdown} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopRegions data={stats.topRegions} />
          </div>
          <ActivityFeed items={activities} />
        </div>
      </div>
    </div>
  );
}
