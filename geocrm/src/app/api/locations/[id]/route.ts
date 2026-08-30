import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { getLocationById } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const location = await getLocationById(user.organizationId, id);
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(location);
}
