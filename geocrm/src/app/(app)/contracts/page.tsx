import { PageHeader } from '@/components/page-header';
import { ContractsManager } from '@/components/contracts/contracts-manager';
import { getCurrentUser } from '@/lib/session';
import { getContracts, getLocationOptions, getInvestorOptions } from '@/lib/queries';
import { can } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [contracts, locations, investors] = await Promise.all([
    getContracts(orgId),
    getLocationOptions(orgId),
    getInvestorOptions(orgId),
  ]);

  return (
    <div>
      <PageHeader title="Umowy" description="Rejestr umów dzierżawy i kontraktów — statusy, wartości, powiązania." />
      <div className="p-4 lg:p-8">
        <ContractsManager
          contracts={contracts}
          locations={locations}
          investors={investors}
          canManage={can(user?.role, 'contracts:manage')}
        />
      </div>
    </div>
  );
}
