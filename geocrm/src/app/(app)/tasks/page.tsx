import { ModulePlaceholder } from '@/components/module-placeholder';

export const dynamic = 'force-dynamic';

export default function TasksPage() {
  return (
    <ModulePlaceholder
      title="Zadania"
      stage="Etap 12"
      description="Zadania z przypisaniem osoby, terminem, priorytetem i powiadomieniami."
      features={[
        'Przypisanie osoby i lokalizacji',
        'Termin, status i priorytet (niski → pilny)',
        'Powiadomienia e-mail o terminach',
        'Widok listy i tablicy (kanban) zadań',
      ]}
    />
  );
}
