import { MapExperience } from '@/components/map/map-experience';
import { getCurrentUser } from '@/lib/session';
import { getLocations } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  const user = await getCurrentUser();
  const locations = await getLocations(user?.organizationId ?? null);
  return <MapExperience locations={locations} />;
}
