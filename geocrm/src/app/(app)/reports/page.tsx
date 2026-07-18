import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  return (
    <ModulePlaceholder
      title="Raporty"
      stage="Etap 13"
      description="Raporty regionów, sprzedaży, handlowców, lokalizacji, inwestorów i instalacji."
      features={[
        'Raporty: regiony, sprzedaż, handlowcy, lokalizacje, inwestorzy, operatorzy, instalacje',
        'Filtry po okresie, regionie i statusie',
        'Eksport do Excel (.xlsx) i PDF',
        'Prognoza liczby opakowań na podstawie danych lokalizacji',
      ]}
    />
  );
}
