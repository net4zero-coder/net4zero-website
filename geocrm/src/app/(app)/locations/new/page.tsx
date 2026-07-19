import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LocationForm } from '@/components/locations/location-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function NewLocationPage() {
  return (
    <div>
      <div className="flex items-center gap-2 border-b px-4 py-3 lg:px-8">
        <Link href="/locations" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          <ArrowLeft className="h-4 w-4" /> Lokalizacje
        </Link>
        <h1 className="text-lg font-semibold">Nowa lokalizacja</h1>
      </div>
      <LocationForm />
    </div>
  );
}
