import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  return (
    <ModulePlaceholder
      title="Dokumenty"
      stage="Etap 11"
      description="Repozytorium dokumentów przypisanych do lokalizacji i inwestorów."
      features={[
        'Upload PDF, Word, Excel oraz zdjęć',
        'Storage: Supabase Storage lub AWS S3',
        'Dokumenty przypisane do lokalizacji / inwestora',
        'Podgląd, pobieranie i wersjonowanie',
      ]}
    />
  );
}
