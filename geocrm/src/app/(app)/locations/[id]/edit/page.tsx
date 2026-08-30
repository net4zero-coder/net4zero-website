import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { LocationForm } from '@/components/locations/location-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/session';
import { getLocationById } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function EditLocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const location = await getLocationById(user?.organizationId ?? null, id);
  if (!location) notFound();

  return (
    <div>
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:px-8">
        <Link href={`/locations/${id}`} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          <ArrowLeft className="h-4 w-4" /> Karta lokalizacji
        </Link>
        <h1 className="truncate text-lg font-semibold">Edycja: {location.name}</h1>
      </div>
      <LocationForm initial={location} />
    </div>
  );
}
