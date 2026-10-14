import { PageHeader } from '@/components/page-header';
import { RegionsManager } from '@/components/regions/regions-manager';
import { getCurrentUser } from '@/lib/session';
import { getRegions, getAgentOptions, getInvestorOptions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function RegionsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [regions, agents, investors] = await Promise.all([
    getRegions(orgId),
    getAgentOptions(orgId),
    getInvestorOptions(orgId),
  ]);

  return (
    <div>
      <PageHeader
        title="Regiony"
        description="Województwa, powiaty, miasta oraz własne obszary rysowane na mapie. Lokalizacje w obszarze są przypisywane automatycznie."
      />
      <div className="p-4 lg:p-8">
        <RegionsManager regions={regions} agents={agents} investors={investors} />
      </div>
    </div>
  );
}
