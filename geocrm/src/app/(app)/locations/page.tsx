import Link from 'next/link';
import { Plus, Map as MapIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { buttonVariants } from '@/components/ui/button';
import { LocationsBrowser } from '@/components/locations/locations-browser';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { getLocations } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function LocationsPage() {
  const user = await getCurrentUser();
  const locations = await getLocations(user?.organizationId ?? null);

  return (
    <div>
      <PageHeader
        title="Lokalizacje"
        description="Pełna lista punktów w systemie CRM."
        action={
          <div className="flex gap-2">
            <Link href="/map" className={cn(buttonVariants({ variant: 'outline' }))}>
              <MapIcon className="h-4 w-4" /> Mapa
            </Link>
            <Link href="/locations/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4" /> Dodaj lokalizację
            </Link>
          </div>
        }
      />
      <div className="p-4 lg:p-8">
        <LocationsBrowser locations={locations} />
      </div>
    </div>
  );
}
