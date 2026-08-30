import { PageHeader } from '@/components/page-header';
import { DocumentsManager } from '@/components/documents/documents-manager';
import { getCurrentUser } from '@/lib/session';
import { getDocuments, getLocationOptions } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId ?? null;
  const [documents, locations] = await Promise.all([getDocuments(orgId), getLocationOptions(orgId)]);

  return (
    <div>
      <PageHeader title="Dokumenty" description="Repozytorium dokumentów przypisanych do lokalizacji (PDF, Word, Excel, zdjęcia)." />
      <div className="p-4 lg:p-8">
        <DocumentsManager documents={documents} locations={locations} />
      </div>
    </div>
  );
}
