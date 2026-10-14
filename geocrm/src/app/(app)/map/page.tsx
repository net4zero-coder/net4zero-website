import { MapExperience } from '@/components/map/map-experience';
import { getCurrentUser } from '@/lib/session';
import { getLocations, getRegions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [locations, regions] = await Promise.all([getLocations(orgId), getRegions(orgId)]);
  return <MapExperience locations={locations} regions={regions} />;
}
