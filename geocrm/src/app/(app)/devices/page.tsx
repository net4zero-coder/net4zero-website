import { PageHeader } from '@/components/page-header';
import { DevicesManager } from '@/components/devices/devices-manager';
import { getCurrentUser } from '@/lib/session';
import { getDevices, getLocationOptions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function DevicesPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [devices, locations] = await Promise.all([getDevices(orgId), getLocationOptions(orgId)]);

  return (
    <div>
      <PageHeader
        title="Urządzenia"
        description="Rejestr recyklomatów: status, instalacje i serwis. Powiązane z lokalizacjami i operatorami."
      />
      <div className="p-4 lg:p-8">
        <DevicesManager devices={devices} locations={locations} />
      </div>
    </div>
  );
}
