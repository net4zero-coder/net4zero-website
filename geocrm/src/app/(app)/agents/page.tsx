import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function AgentsPage() {
  return (
    <ModulePlaceholder
      title="Handlowcy"
      stage="Etap 9"
      description="Region, lokalizacje, zadania, kalendarz, cele sprzedażowe i ranking."
      features={[
        'Przypisany region i lista lokalizacji handlowca',
        'Zadania i kalendarz spotkań',
        'Cele sprzedażowe (SalesGoal) i realizacja',
        'Statystyki i ranking handlowców',
      ]}
    />
  );
}
