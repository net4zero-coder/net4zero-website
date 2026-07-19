import { PageHeader } from '@/components/page-header';
import { ReportsView } from '@/components/reports/reports-view';
import { getCurrentUser } from '@/lib/session';
import { getLocations, getAgents, getInvestors, getRegions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [locations, agents, investors, regions] = await Promise.all([
    getLocations(orgId),
    getAgents(orgId),
    getInvestors(orgId),
    getRegions(orgId),
  ]);

  return (
    <div>
      <PageHeader title="Raporty" description="Zestawienia sprzedaży, regionów, handlowców i inwestorów z eksportem do CSV." />
      <div className="p-4 lg:p-8">
        <ReportsView locations={locations} agents={agents} investors={investors} regions={regions} />
      </div>
    </div>
  );
}
