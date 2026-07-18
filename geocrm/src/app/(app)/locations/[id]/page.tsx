import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Map as MapIcon } from 'lucide-react';
import { LocationDetailView } from '@/components/locations/location-detail-view';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { getLocationById } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const location = await getLocationById(user?.organizationId ?? null, id);
  if (!location) notFound();

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-3 lg:px-8">
        <Link href="/locations" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          <ArrowLeft className="h-4 w-4" /> Lokalizacje
        </Link>
        <Link href="/map" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          <MapIcon className="h-4 w-4" /> Pokaż na mapie
        </Link>
      </div>
      <div className="mx-auto max-w-3xl p-4 lg:p-8">
        <div className="overflow-hidden rounded-lg border bg-card">
          <LocationDetailView location={location} />
        </div>
      </div>
    </div>
  );
}
